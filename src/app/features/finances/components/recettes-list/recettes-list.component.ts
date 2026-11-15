import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { AutreRecetteService } from '../../../../core/services/autre-recette.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AutreRecette } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-recettes-list',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './recettes-list.component.html',
})
export class RecettesListComponent {
  year = input.required<number>();
  month = input.required<number>();

  receiptRequested = output<number>();

  private autreRecetteService = inject(AutreRecetteService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<AutreRecette[]>([]);

  columns: DataTableColumn<AutreRecette>[] = [
    { key: 'recetteDate', label: 'Date', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'description', label: 'Description', format: (row) => row.description || '—' },
    { key: 'amount', label: 'Montant', align: 'right', sortable: true, format: (row) => this.formatFcfa(row.amount) },
    { key: 'registeredByUsername', label: 'Enregistré par' },
  ];

  constructor() {
    effect(() => {
      this.year();
      this.month();
      this.load();
    });
  }

  onReceipt(row: AutreRecette): void {
    this.receiptRequested.emit(row.id);
  }

  async onCancel(row: AutreRecette): Promise<void> {
    const confirmed = await this.confirmDialog.ask(
      'Annuler cette recette',
      `Confirmer l'annulation de la recette "${row.source}" du ${row.recetteDate} ?`,
      { danger: true, confirmLabel: 'Annuler la recette' }
    );
    if (!confirmed) return;

    this.autreRecetteService.cancel(row.id).subscribe({
      next: () => {
        this.toastService.success('Recette annulée');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de l\'annulation de la recette'),
    });
  }

  load(): void {
    this.loading.set(true);
    this.autreRecetteService.list(this.year(), this.month()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les recettes');
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}