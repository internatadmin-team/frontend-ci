import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../../shared/icon/icon.component';
import { DataTableComponent } from '../../../../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../../../../shared/components/data-table/data-table.model';
import { PaiementEnfantService } from '../../../../../core/services/paiement-enfant.service';
import { ConfirmDialogService } from '../../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { InscriptionSuivi, SuiviStatusFilter } from '../../../../../core/models/paiement.model';
import { SUIVI_STATUS_LABELS } from '../../../../../core/models/common.model';

@Component({
  selector: 'app-suivi-inscriptions',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent],
  templateUrl: './suivi-inscriptions.component.html',
})
export class SuiviInscriptionsComponent {
  statusFilter = input<SuiviStatusFilter>('ALL');

  payRequested = output<InscriptionSuivi>();
  receiptRequested = output<number>();

  private paiementEnfantService = inject(PaiementEnfantService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<InscriptionSuivi[]>([]);

  columns: DataTableColumn<InscriptionSuivi>[] = [
    { key: 'matricule', label: 'Matricule', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    { key: 'montantAttendu', label: 'Montant attendu', align: 'right', format: (row) => this.formatFcfa(row.montantAttendu) },
    { key: 'statut', label: 'Statut', format: (row) => SUIVI_STATUS_LABELS[row.statut] ?? row.statut },
    { key: 'paymentDate', label: 'Date de paiement', format: (row) => row.paymentDate || '—' },
  ];

  constructor() {
    // Pas de paramètre year/month pour cet endpoint (contrairement aux mensualités/salaires)
    effect(() => {
      this.statusFilter();
      this.load();
    });
  }

  onPay(row: InscriptionSuivi): void {
    this.payRequested.emit(row);
  }

  onReceipt(row: InscriptionSuivi): void {
    if (row.paiementId != null) this.receiptRequested.emit(row.paiementId);
  }

  async onCancelPaiement(row: InscriptionSuivi): Promise<void> {
    if (row.paiementId == null) return;

    const confirmed = await this.confirmDialog.ask(
      'Annuler ce paiement',
      `Confirmer l'annulation du paiement d'inscription de "${row.fullName}" ?`,
      { danger: true, confirmLabel: 'Annuler le paiement' }
    );
    if (!confirmed) return;

    this.paiementEnfantService.cancel(row.paiementId).subscribe({
      next: () => {
        this.toastService.success('Paiement annulé');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de l\'annulation du paiement'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.paiementEnfantService.getInscriptions(this.statusFilter()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger le suivi des inscriptions');
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}