import { Component, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DepenseService } from '../../../../core/services/depense.service';
import { CategorieDepenseService } from '../../../../core/services/categorie-depense.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Depense, CategorieDepense } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-depense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './depense-form.component.html',
})
export class DepenseFormComponent implements OnInit {
  saved = output<Depense>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private depenseService = inject(DepenseService);
  private categorieDepenseService = inject(CategorieDepenseService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  categories = signal<CategorieDepense[]>([]);
  loading = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    categorieId: [null as number | null, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0)]],
    expenseDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    description: [''],
  });

  ngOnInit(): void {
    this.categorieDepenseService.list('ACTIVE').subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.toastService.error('Impossible de charger les catégories'),
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.createDepense(false);
  }

private createDepense(confirmDuplicate: boolean): void {
    this.loading.set(true);
    const value = this.form.getRawValue();

    this.depenseService.create(
      {
        categorieId: value.categorieId!,
        amount: value.amount!,
        expenseDate: value.expenseDate || undefined,
        description: value.description || undefined,
      },
      confirmDuplicate
    ).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.toastService.success('Dépense enregistrée avec succès');
        this.saved.emit(result);
      },
      error: async (err: HttpErrorResponse) => {
        const isDuplicate = err.error?.error === 'POSSIBLE_DUPLICATE';

        if (isDuplicate && !confirmDuplicate) {
          const confirmed = await this.confirmDialog.ask(
            'Doublon détecté',
            err.error?.message || 'Une dépense similaire existe déjà. Voulez-vous quand même l\'enregistrer ?',
            { confirmLabel: 'Enregistrer quand même' }
          );
          if (confirmed) {
            this.createDepense(true);
          } else {
            this.loading.set(false);
          }
          return;
        }
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Erreur lors de l\'enregistrement de la dépense');
      },
    });
  }
  onCancel(): void {
    this.cancelled.emit();
  }
}