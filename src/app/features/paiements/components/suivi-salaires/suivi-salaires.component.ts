import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table.model';
import { PaiementSalaireService } from '../../../../core/services/paiement-salaire.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { SalaireSuivi, SuiviStatusFilter } from '../../../../core/models/paiement.model';
import { SUIVI_STATUS_LABELS } from '../../../../core/models/common.model';

@Component({
  selector: 'app-suivi-salaires',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent],
  templateUrl: './suivi-salaires.component.html',
})
export class SuiviSalairesComponent {
  year = input.required<number>();
  month = input.required<number>();
  statusFilter = input<SuiviStatusFilter>('ALL');

  payRequested = output<SalaireSuivi>();
  receiptRequested = output<number>();

  private paiementSalaireService = inject(PaiementSalaireService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<SalaireSuivi[]>([]);

  columns: DataTableColumn<SalaireSuivi>[] = [
    { key: 'matricule', label: 'Matricule', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    {
      key: 'montantAttendu',
      label: 'Montant attendu',
      align: 'right',
      sortable: true,
      format: (row) => this.formatFcfa(row.montantAttendu),
    },
    { key: 'statut', label: 'Statut', format: (row) => SUIVI_STATUS_LABELS[row.statut] ?? row.statut },
    { key: 'paymentDate', label: 'Date de paiement', format: (row) => row.paymentDate || '—' },
  ];

  constructor() {
    effect(() => {
      // Se ré-exécute automatiquement quand year(), month() ou statusFilter() changent
      this.year();
      this.month();
      this.statusFilter();
      this.load();
    });
  }

  onPay(row: SalaireSuivi): void {
    this.payRequested.emit(row);
  }

  onReceipt(row: SalaireSuivi): void {
    if (row.paiementId != null) this.receiptRequested.emit(row.paiementId);
  }

  async onCancelPaiement(row: SalaireSuivi): Promise<void> {
    if (row.paiementId == null) return;

    const confirmed = await this.confirmDialog.ask(
      'Annuler ce paiement',
      `Confirmer l'annulation du paiement de "${row.fullName}" ?`,
      { danger: true, confirmLabel: 'Annuler le paiement' }
    );
    if (!confirmed) return;

    this.paiementSalaireService.cancel(row.paiementId).subscribe({
      next: () => {
        this.toastService.success('Paiement annulé');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de l\'annulation du paiement'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.paiementSalaireService.getSuivi(this.year(), this.month(), this.statusFilter()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger le suivi des salaires');
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}