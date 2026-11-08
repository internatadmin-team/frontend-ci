import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Enfant } from '../../../core/models/enfant.model';
import { EnfantService } from '../../../core/services/enfant.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast/toast.service';


function birthInfoRequiredValidator(group: AbstractControl): ValidationErrors | null {
  const birthDate = group.get('birthDate')?.value;
  const approximateAge = group.get('approximateAge')?.value;
  return birthDate || approximateAge != null ? null : { birthInfoRequired: true };
}

@Component({
  selector: 'app-eleve-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './eleve-form.component.html',
})
export class EleveFormComponent implements OnInit {
  eleve = input<Enfant | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private enfantService = inject(EnfantService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  form = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      birthDate: [''],
      approximateAge: [null as number | null, [Validators.min(0), Validators.max(30)]],
      gender: ['M', [Validators.required]],
      guardianName: ['', [Validators.required]],
      guardianPhone: ['', [Validators.required]],
      neighborhood: [''],
      entryDate: ['', [Validators.required]],
      roomGroup: [''],
      registrationFee: [0, [Validators.required, Validators.min(0)]],
      monthlyFee: [0, [Validators.required, Validators.min(0)]],
    },
    { validators: birthInfoRequiredValidator }
  );

  loading = signal(false);
  submitted = signal(false);

  get isEditMode(): boolean {
    return this.eleve() != null;
  }

  ngOnInit(): void {
    const current = this.eleve();
    if (current) {
      this.form.patchValue({
        firstName: current.firstName,
        lastName: current.lastName,
        birthDate: current.birthDate,
        approximateAge: current.approximateAge,
        gender: current.gender,
        guardianName: current.guardianName,
        guardianPhone: current.guardianPhone,
        neighborhood: current.neighborhood,
        roomGroup: current.roomGroup,
        registrationFee: current.registrationFee,
        monthlyFee: current.monthlyFee,
      });
      // La date d'entrée n'est pas modifiable après création
      this.form.get('entryDate')?.disable();
    } else {
      this.form.get('entryDate')?.enable();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    const value = this.form.getRawValue();

    if (this.isEditMode) {
      this.enfantService.update(this.eleve()!.id, {
        firstName: value.firstName!,
        lastName: value.lastName!,
        birthDate: value.birthDate || undefined,
        approximateAge: value.approximateAge ?? undefined,
        gender: value.gender as 'M' | 'F',
        guardianName: value.guardianName!,
        guardianPhone: value.guardianPhone!,
        neighborhood: value.neighborhood || undefined,
        roomGroup: value.roomGroup || undefined,
        registrationFee: value.registrationFee!,
        monthlyFee: value.monthlyFee!,
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.success('Élève modifié avec succès');
          this.saved.emit();
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Erreur lors de la modification de l\'élève');
        },
      });
      return;
    }

    this.createEleve(false);
  }

  private createEleve(confirmDuplicate: boolean): void {
    const value = this.form.getRawValue();

    this.enfantService.create(
      {
        firstName: value.firstName!,
        lastName: value.lastName!,
        birthDate: value.birthDate || undefined,
        approximateAge: value.approximateAge ?? undefined,
        gender: value.gender as 'M' | 'F',
        guardianName: value.guardianName!,
        guardianPhone: value.guardianPhone!,
        neighborhood: value.neighborhood || undefined,
        entryDate: value.entryDate!,
        roomGroup: value.roomGroup || undefined,
        registrationFee: value.registrationFee!,
        monthlyFee: value.monthlyFee!,
      },
      confirmDuplicate
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Élève ajouté avec succès');
        this.saved.emit();
      },
      error: async (err: HttpErrorResponse) => {
        if (err.status === 409 && !confirmDuplicate) {
          const confirmed = await this.confirmDialog.ask(
            'Doublon détecté',
            'Un élève avec des informations similaires existe déjà. Voulez-vous quand même l\'ajouter ?',
            { confirmLabel: 'Ajouter quand même' }
          );
          if (confirmed) {
            this.createEleve(true);
          } else {
            this.loading.set(false);
          }
          return;
        }
        this.loading.set(false);
        this.toastService.error('Erreur lors de l\'ajout de l\'élève');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}