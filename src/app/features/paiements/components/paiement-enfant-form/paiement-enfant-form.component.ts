import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EnfantService } from '../../../../core/services/enfant.service';
import { PaiementEnfantService } from '../../../../core/services/paiement-enfant.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Enfant } from '../../../../core/models/enfant.model';
import { PaiementEnfant } from '../../../../core/models/paiement.model';
import {
  PaymentMethod,
  PaymentType,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  toSelectOptions,
} from '../../../../core/models/common.model';

/** Empêche d'enregistrer une mensualité pour un mois qui n'est pas encore arrivé */
function noFutureMonthValidator(group: AbstractControl): ValidationErrors | null {
  const paymentType = group.get('paymentType')?.value;
  if (paymentType !== 'MENSUALITE') return null;

  const year = group.get('concernedYear')?.value;
  const month = group.get('concernedMonth')?.value;
  if (year == null || month == null) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    return { futureMonth: true };
  }
  return null;
}

@Component({
  selector: 'app-paiement-enfant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paiement-enfant-form.component.html',
})
export class PaiementEnfantFormComponent implements OnInit {
  prefillEnfantId = input<number | null>(null);
  prefillPaymentType = input<PaymentType | null>(null);
  prefillYear = input<number | null>(null);
  prefillMonth = input<number | null>(null);
  /** Montant exact attendu (utilisé pour l'inscription : le champ devient en lecture seule) */
  prefillAmount = input<number | null>(null);
  /** Montant réellement dû pour cette mensualité, utilisé pour distinguer partiel/excédent */
  prefillExpectedAmount = input<number | null>(null);

  saved = output<PaiementEnfant>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private enfantService = inject(EnfantService);
  private paiementEnfantService = inject(PaiementEnfantService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  paymentMethodOptions = toSelectOptions(PAYMENT_METHOD_LABELS);
  paymentTypeOptions = toSelectOptions(PAYMENT_TYPE_LABELS);
  enfants = signal<Enfant[]>([]);
  loading = signal(false);
  submitted = signal(false);
  readonly currentYear = new Date().getFullYear();

  form = this.fb.group(
    {
      enfantId: [null as number | null, [Validators.required]],
      paymentType: ['MENSUALITE' as PaymentType, [Validators.required]],
      paymentMethod: ['ESPECES' as PaymentMethod, [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0)]],
      concernedYear: [new Date().getFullYear()],
      concernedMonth: [new Date().getMonth() + 1],
      paymentDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    },
    { validators: noFutureMonthValidator }
  );

  get isMensualite(): boolean {
    return this.form.get('paymentType')?.value === 'MENSUALITE';
  }

  get isPrefilled(): boolean {
    return this.prefillEnfantId() != null;
  }

  /** Vrai quand le montant est verrouillé (cas de l'inscription à montant fixe) */
  get isAmountLocked(): boolean {
    return this.prefillPaymentType() === 'INSCRIPTION' && this.prefillAmount() != null;
  }

  /** Dernier mois sélectionnable pour l'année choisie (empêche les mois futurs) */
  get maxSelectableMonth(): number {
    const year = this.form.get('concernedYear')?.value;
    const now = new Date();
    if (year === now.getFullYear()) return now.getMonth() + 1;
    if (year != null && year > now.getFullYear()) return 0;
    return 12;
  }

  ngOnInit(): void {
    this.enfantService.list('ACTIF').subscribe({
      next: (data) => this.enfants.set(data),
      error: () => this.toastService.error('Impossible de charger la liste des élèves'),
    });

    if (this.prefillEnfantId() != null) {
      this.form.patchValue({ enfantId: this.prefillEnfantId() });
      this.form.get('enfantId')?.disable();
    }
    if (this.prefillPaymentType()) {
      this.form.patchValue({ paymentType: this.prefillPaymentType()! });
      this.form.get('paymentType')?.disable();
    }
    if (this.prefillYear() != null && this.prefillMonth() != null) {
      this.form.patchValue({ concernedYear: this.prefillYear()!, concernedMonth: this.prefillMonth()! });
    }
    // Montant exact et non modifiable pour une inscription
    if (this.isAmountLocked) {
      this.form.patchValue({ amount: this.prefillAmount()! });
      this.form.get('amount')?.disable();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.createPaiement(false);
  }

  private createPaiement(confirmPartial: boolean): void {
    this.loading.set(true);
    const value = this.form.getRawValue();
    const isInscription = value.paymentType === 'INSCRIPTION';

    this.paiementEnfantService.create({
      enfantId: value.enfantId!,
      paymentType: value.paymentType as PaymentType,
      paymentMethod: value.paymentMethod as PaymentMethod,
      amount: value.amount!,
      concernedYear: value.paymentType === 'MENSUALITE' ? value.concernedYear ?? undefined : undefined,
      concernedMonth: value.paymentType === 'MENSUALITE' ? value.concernedMonth ?? undefined : undefined,
      paymentDate: value.paymentDate || undefined,
      confirmPartial,
    }).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.toastService.success('Paiement enregistré avec succès');
        this.saved.emit(result);
      },
      error: async (err: HttpErrorResponse) => {
        const backendMessage = err.error?.message as string | undefined;

        // Inscription : montant fixe -> tout écart est une erreur, jamais une confirmation
        if (err.status === 409 && isInscription) {
          this.loading.set(false);
          this.toastService.error(backendMessage || 'Le montant ne correspond pas au montant d\'inscription attendu.');
          return;
        }

        // Mensualité : on compare nous-mêmes au montant dû pour choisir le bon message
        if (err.status === 409 && !isInscription && !confirmPartial) {
          const expected = this.prefillExpectedAmount();
          const diff = expected != null ? value.amount! - expected : null;

          // Montant supérieur : impossible à enregistrer, aucune confirmation à proposer
          if (diff != null && diff > 0) {
            this.loading.set(false);
            this.toastService.error(
              `Le montant saisi dépasse de ${diff} FCFA le montant dû. Un paiement ne peut pas excéder le montant restant.`
            );
            return;
          }

          // Montant inférieur : situation normale de paiement partiel, à confirmer
          if (diff != null && diff < 0) {
            const confirmed = await this.confirmDialog.ask(
              'Montant inférieur au montant dû',
              `Le montant saisi est inférieur de ${Math.abs(diff)} FCFA au montant dû. Voulez-vous enregistrer ce paiement partiel quand même ?`,
              { confirmLabel: 'Enregistrer quand même' }
            );
            if (confirmed) {
              this.createPaiement(true);
            } else {
              this.loading.set(false);
            }
            return;
          }

          // Montant dû inconnu côté frontend ou cas non prévu : on relaie l'erreur backend telle quelle
          this.loading.set(false);
          this.toastService.error(backendMessage || 'Erreur lors de l\'enregistrement du paiement');
          return;
        }

        this.loading.set(false);
        this.toastService.error(backendMessage || 'Erreur lors de l\'enregistrement du paiement');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}