import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table.model';
import { PaiementEnfantService } from '../../../../core/services/paiement-enfant.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { SuiviMensuel, SuiviStatusFilter } from '../../../../core/models/paiement.model';
import { SUIVI_STATUS_LABELS } from '../../../../core/models/common.model';

@Component({
  selector: 'app-suivi-mensualites',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent],
  templateUrl: './suivi-mensualites.component.html',
})
export class SuiviMensualitesComponent {
  year = input.required<number>();
  month = input.required<number>();
  statusFilter = input<SuiviStatusFilter>('ALL');

  payRequested = output<SuiviMensuel>();
  receiptRequested = output<number>();

  private paiementEnfantService = inject(PaiementEnfantService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<SuiviMensuel[]>([]);

  columns: DataTableColumn<SuiviMensuel>[] = [
    { key: 'matricule', label: 'Matricule', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    { key: 'guardianPhone', label: 'Téléphone tuteur' },
    { key: 'montantDu', label: 'Montant dû', align: 'right', format: (row) => this.formatFcfa(row.montantDu) },
    { key: 'montantPaye', label: 'Montant payé', align: 'right', format: (row) => this.formatFcfa(row.montantPaye) },
    { key: 'montantRestant', label: 'Reste à payer', align: 'right', format: (row) => this.formatFcfa(row.montantRestant) },
    { key: 'statutPaiement', label: 'Statut', format: (row) => SUIVI_STATUS_LABELS[row.statutPaiement] ?? row.statutPaiement },
  ];

  constructor() {
    effect(() => {
      this.year();
      this.month();
      this.statusFilter();
      this.load();
    });
  }

  onPay(row: SuiviMensuel): void {
    this.payRequested.emit(row);
  }

  onReceipt(row: SuiviMensuel): void {
    const lastId = row.paiementIds.at(-1);
    if (lastId != null) this.receiptRequested.emit(lastId);
  }

  async onCancelPaiement(row: SuiviMensuel): Promise<void> {
    if (row.paiementIds.length !== 1) return; // Historique multiple : annulation via détail élève (à venir)

    const confirmed = await this.confirmDialog.ask(
      'Annuler ce paiement',
      `Confirmer l'annulation du paiement de "${row.fullName}" ?`,
      { danger: true, confirmLabel: 'Annuler le paiement' }
    );
    if (!confirmed) return;

    this.paiementEnfantService.cancel(row.paiementIds[0]).subscribe({
      next: () => {
        this.toastService.success('Paiement annulé');
        this.load();
      },
      error: () => this.toastService.error('Erreur lors de l\'annulation du paiement'),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.paiementEnfantService.getMensualites(this.year(), this.month(), this.statusFilter()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger le suivi des mensualités');
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}