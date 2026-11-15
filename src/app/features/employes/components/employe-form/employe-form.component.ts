import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeService } from '../../../../core/services/employe.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Employe } from '../../../../core/models/employe.model';
import {
  EmployeFunction,
  ContractType,
  EMPLOYE_FUNCTION_LABELS,
  CONTRACT_TYPE_LABELS,
  toSelectOptions,
} from '../../../../core/models/common.model';

@Component({
  selector: 'app-employe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employe-form.component.html',
})
export class EmployeFormComponent implements OnInit {
  employe = input<Employe | null>(null);
  saved = output<void>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private employeService = inject(EmployeService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  functionOptions = toSelectOptions(EMPLOYE_FUNCTION_LABELS);
  contractTypeOptions = toSelectOptions(CONTRACT_TYPE_LABELS);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    phone: ['', [Validators.required]],
    function: ['MAITRE_CORANIQUE' as EmployeFunction, [Validators.required]],
    contractType: ['TEMPS_PLEIN' as ContractType, [Validators.required]],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
    hireDate: ['', [Validators.required]],
  });

  loading = signal(false);
  submitted = signal(false);

  get isEditMode(): boolean {
    return this.employe() != null;
  }

  ngOnInit(): void {
    const current = this.employe();
    if (current) {
      this.form.patchValue({
        firstName: current.firstName,
        lastName: current.lastName,
        phone: current.phone,
        function: current.function,
        contractType: current.contractType,
        baseSalary: current.baseSalary,
      });
      this.form.get('hireDate')?.disable();
    } else {
      this.form.get('hireDate')?.enable();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    const value = this.form.getRawValue();

    if (this.isEditMode) {
      this.employeService.update(this.employe()!.id, {
        firstName: value.firstName!,
        lastName: value.lastName!,
        phone: value.phone!,
        function: value.function as EmployeFunction,
        contractType: value.contractType as ContractType,
        baseSalary: value.baseSalary!,
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.success('Employé modifié avec succès');
          this.saved.emit();
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Erreur lors de la modification de l\'employé');
        },
      });
      return;
    }

    this.createEmploye(false);
  }

  private createEmploye(confirmDuplicate: boolean): void {
    const value = this.form.getRawValue();

    this.employeService.create(
      {
        firstName: value.firstName!,
        lastName: value.lastName!,
        phone: value.phone!,
        function: value.function as EmployeFunction,
        contractType: value.contractType as ContractType,
        baseSalary: value.baseSalary!,
        hireDate: value.hireDate!,
      },
      confirmDuplicate
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Employé ajouté avec succès');
        this.saved.emit();
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const isDuplicate = err.error?.error === 'POSSIBLE_DUPLICATE';
        if (isDuplicate) {
          this.toastService.error(
            err.error?.message || 'Un employé avec des informations identiques (notamment le téléphone) existe déjà.'
          );
          return;
        }
        this.toastService.error('Erreur lors de l\'ajout de l\'employé');
      },
    });
  }
}