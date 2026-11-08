import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { DepenseService } from '../../../../core/services/depense.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Depense } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-depenses-list',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './depenses-list.component.html',
})
export class DepensesListComponent {
  year = input.required<number>();
  month = input.required<number>();

  receiptRequested = output<number>();

  private depenseService = inject(DepenseService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<Depense[]>([]);

  columns: DataTableColumn<Depense>[] = [
    { key: 'expenseDate', label: 'Date', sortable: true },
    { key: 'categorieName', label: 'Catégorie', sortable: true },
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

  onReceipt(row: Depense): void {
    this.receiptRequested.emit(row.id);
  }

  async onCancel(row: Depense): Promise<void> {
    const confirmed = await this.confirmDialog.ask(
      'Annuler cette dépense',
      `Confirmer l'annulation de la dépense "${row.categorieName}" du ${row.expenseDate} ?`,
      { danger: true, confirmLabel: 'Annuler la dépense' }
    );
    if (!confirmed) return;

    this.depenseService.cancel(row.id).subscribe({
      next: () => {
        this.toastService.success('Dépense annulée');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de l\'annulation de la dépense'),
    });
  }

  load(): void {
    this.loading.set(true);
    this.depenseService.list(this.year(), this.month()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les dépenses');
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}