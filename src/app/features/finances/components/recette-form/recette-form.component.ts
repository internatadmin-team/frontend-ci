import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AutreRecetteService } from '../../../../core/services/autre-recette.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AutreRecette } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-recette-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recette-form.component.html',
})
export class RecetteFormComponent {
  saved = output<AutreRecette>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private autreRecetteService = inject(AutreRecetteService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    source: ['', [Validators.required, Validators.minLength(1)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    recetteDate: [new Date().toISOString().slice(0, 10), [Validators.required]],
    description: [''],
  });

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.createRecette(false);
  }

private createRecette(confirmDuplicate: boolean): void {
    this.loading.set(true);
    const value = this.form.getRawValue();

    this.autreRecetteService.create(
      {
        source: value.source!,
        amount: value.amount!,
        recetteDate: value.recetteDate || undefined,
        description: value.description || undefined,
      },
      confirmDuplicate
    ).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.toastService.success('Recette enregistrée avec succès');
        this.saved.emit(result);
      },
      error: async (err: HttpErrorResponse) => {
        const isDuplicate = err.error?.error === 'POSSIBLE_DUPLICATE';

        if (isDuplicate && !confirmDuplicate) {
          const confirmed = await this.confirmDialog.ask(
            'Doublon détecté',
            err.error?.message || 'Une recette similaire existe déjà. Voulez-vous quand même l\'enregistrer ?',
            { confirmLabel: 'Enregistrer quand même' }
          );
          if (confirmed) {
            this.createRecette(true);
          } else {
            this.loading.set(false);
          }
          return;
        }
        this.loading.set(false);
        this.toastService.error(err.error?.message || 'Erreur lors de l\'enregistrement de la recette');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
} 