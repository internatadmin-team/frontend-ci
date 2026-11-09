import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EmployeService } from '../../../../core/services/employe.service';
import { PaiementSalaireService } from '../../../../core/services/paiement-salaire.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Employe } from '../../../../core/models/employe.model';
import { PaiementSalaire } from '../../../../core/models/paiement.model';
import { PaymentMethod, PAYMENT_METHOD_LABELS, toSelectOptions } from '../../../../core/models/common.model';

function noFutureMonthValidator(group: AbstractControl): ValidationErrors | null {
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
  selector: 'app-paiement-salaire-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paiement-salaire-form.component.html',
})
export class PaiementSalaireFormComponent implements OnInit {
  prefillEmployeId = input<number | null>(null);
  prefillYear = input<number | null>(null);
  prefillMonth = input<number | null>(null);

  saved = output<PaiementSalaire>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private employeService = inject(EmployeService);
  private paiementSalaireService = inject(PaiementSalaireService);
  private toastService = inject(ToastService);

  paymentMethodOptions = toSelectOptions(PAYMENT_METHOD_LABELS);
  employes = signal<Employe[]>([]);
  loading = signal(false);
  submitted = signal(false);
  readonly currentYear = new Date().getFullYear();

  form = this.fb.group(
    {
      employeId: [null as number | null, [Validators.required]],
      paymentMethod: ['ESPECES' as PaymentMethod, [Validators.required]],
      concernedYear: [new Date().getFullYear(), [Validators.required]],
      concernedMonth: [new Date().getMonth() + 1, [Validators.required]],
      paymentDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    },
    { validators: noFutureMonthValidator }
  );

  get isPrefilled(): boolean {
    return this.prefillEmployeId() != null;
  }

  get maxSelectableMonth(): number {
    const year = this.form.get('concernedYear')?.value;
    const now = new Date();
    if (year === now.getFullYear()) return now.getMonth() + 1;
    if (year != null && year > now.getFullYear()) return 0;
    return 12;
  }

  ngOnInit(): void {
    this.employeService.list('ACTIF').subscribe({
      next: (data) => this.employes.set(data),
      error: () => this.toastService.error('Impossible de charger la liste des employés'),
    });

    if (this.prefillEmployeId() != null) {
      this.form.patchValue({ employeId: this.prefillEmployeId() });
      this.form.get('employeId')?.disable();
    }
    if (this.prefillYear() != null && this.prefillMonth() != null) {
      this.form.patchValue({ concernedYear: this.prefillYear()!, concernedMonth: this.prefillMonth()! });
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    const value = this.form.getRawValue();

    this.paiementSalaireService.create({
      employeId: value.employeId!,
      paymentMethod: value.paymentMethod as PaymentMethod,
      concernedYear: value.concernedYear!,
      concernedMonth: value.concernedMonth!,
      paymentDate: value.paymentDate || undefined,
    }).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.toastService.success('Paiement de salaire enregistré');
        this.saved.emit(result);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erreur lors de l\'enregistrement du paiement');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}