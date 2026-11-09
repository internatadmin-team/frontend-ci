import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../../../shared/icon/icon.component';

import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CategorieDepenseService } from '../../../../core/services/categorie-depense.service';
import { CategorieDepense } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-categories-depenses-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './categories-depenses-modal.component.html',
})
export class CategoriesDepensesModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categorieDepenseService = inject(CategorieDepenseService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  categories = signal<CategorieDepense[]>([]);
  loading = signal(true);
  submitting = signal(false);
  submitted = signal(false);

  isAdmin = computed(() => this.authService.getCurrentUser()?.role === 'ADMIN');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  onSubmit(): void {
    if (!this.isAdmin()) return; // sécurité supplémentaire côté client, en plus du masquage du formulaire

    this.submitted.set(true);
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.categorieDepenseService.create({
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(false);
        this.form.reset();
        this.toastService.success('Catégorie ajoutée avec succès');
        this.load();
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Erreur lors de l\'ajout de la catégorie');
      },
    });
  }

  async onDeactivate(categorie: CategorieDepense): Promise<void> {
    if (!this.isAdmin()) return;

    const confirmed = await this.confirmDialog.ask(
      'Désactiver cette catégorie',
      `Confirmer la désactivation de "${categorie.name}" ? Elle ne pourra plus être utilisée pour de nouvelles dépenses.`,
      { danger: true, confirmLabel: 'Désactiver' }
    );
    if (!confirmed) return;

    this.categorieDepenseService.deactivate(categorie.id).subscribe({
      next: () => {
        this.toastService.success('Catégorie désactivée');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de la désactivation de la catégorie'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.categorieDepenseService.list('ACTIVE').subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les catégories');
      },
    });
  }
}