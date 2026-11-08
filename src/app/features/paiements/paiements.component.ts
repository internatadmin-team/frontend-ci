import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { SuiviMensualitesComponent } from './components/suivi-mensualites/suivi-mensualites.component';

import { SuiviSalairesComponent } from './components/suivi-salaires/suivi-salaires.component';
import { PaiementEnfantFormComponent } from './components/paiement-enfant-form/paiement-enfant-form.component';
import { PaiementSalaireFormComponent } from './components/paiement-salaire-form/paiement-salaire-form.component';
import { PaiementRecuComponent, RecuKind } from './components/paiement-recu/paiement-recu.component';
import { PaiementEnfantService } from '../../core/services/paiement-enfant.service';
import { PaiementSalaireService } from '../../core/services/paiement-salaire.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { SuiviMensuel, InscriptionSuivi, SalaireSuivi, RecuPaiement, RecuSalaire, SuiviStatusFilter } from '../../core/models/paiement.model';
import { PaymentType } from '../../core/models/common.model';
import { SuiviInscriptionsComponent } from './components/suivi-inscriptions/suivi-inscriptions/suivi-inscriptions.component';

type MainTab = 'eleves' | 'salaires';
type EleveSubTab = 'mensualites' | 'inscriptions';

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

@Component({
  selector: 'app-paiements',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    SuiviMensualitesComponent,
    SuiviInscriptionsComponent,
    SuiviSalairesComponent,
    PaiementEnfantFormComponent,
    PaiementSalaireFormComponent,
    PaiementRecuComponent,
  ],
  templateUrl: './paiements.component.html',
})
export class PaiementsComponent {
  private paiementEnfantService = inject(PaiementEnfantService);
  private paiementSalaireService = inject(PaiementSalaireService);
  private toastService = inject(ToastService);

  mainTab = signal<MainTab>('eleves');
  eleveSubTab = signal<EleveSubTab>('mensualites');

  today = new Date();
  year = signal(this.today.getFullYear());
  month = signal(this.today.getMonth() + 1);
  statusFilter = signal<SuiviStatusFilter>('ALL');

  moisOptions = MOIS_FR.map((label, index) => ({ value: index + 1, label }));

  showPaiementEnfantModal = signal(false);
  prefillEnfantId = signal<number | null>(null);
  prefillPaymentType = signal<PaymentType | null>(null);
  prefillAmount = signal<number | null>(null);
  prefillExpectedAmount = signal<number | null>(null); // 👈 NOUVEAU

  showPaiementSalaireModal = signal(false);
  prefillEmployeId = signal<number | null>(null);

  showRecuModal = signal(false);
  recuKind = signal<RecuKind>('eleve');
  recuEleve = signal<RecuPaiement | null>(null);
  recuSalaire = signal<RecuSalaire | null>(null);

  refreshKey = signal(0);

  onMainTabChange(tab: MainTab): void {
    this.mainTab.set(tab);
  }

  onEleveSubTabChange(tab: EleveSubTab): void {
    this.eleveSubTab.set(tab);
  }

  onYearChange(value: number): void {
    this.year.set(value);
  }

  onMonthChange(value: number): void {
    this.month.set(value);
  }

  onStatusFilterChange(value: SuiviStatusFilter): void {
    this.statusFilter.set(value);
  }

  // ===== Élèves : mensualités =====

  onPayMensualite(row: SuiviMensuel): void {
    this.prefillEnfantId.set(row.enfantId);
    this.prefillPaymentType.set('MENSUALITE');
    this.prefillAmount.set(null);
    this.prefillExpectedAmount.set(row.montantRestant); // 👈 montant dû
    this.showPaiementEnfantModal.set(true);
  }

  // ===== Élèves : inscriptions =====

  onPayInscription(row: InscriptionSuivi): void {
    this.prefillEnfantId.set(row.enfantId);
    this.prefillPaymentType.set('INSCRIPTION');
    this.prefillAmount.set(row.montantAttendu);
    this.prefillExpectedAmount.set(null); // non utilisé
    this.showPaiementEnfantModal.set(true);
  }

  onPaiementEnfantSaved(): void {
    this.showPaiementEnfantModal.set(false);
    this.prefillEnfantId.set(null);
    this.prefillPaymentType.set(null);
    this.prefillAmount.set(null);
    this.prefillExpectedAmount.set(null); // 👈 réinitialisation
    this.refreshKey.update((v) => v + 1);
  }

  onReceiptEleve(paiementId: number): void {
    this.paiementEnfantService.getReceiptData(paiementId).subscribe({
      next: (data) => {
        this.recuKind.set('eleve');
        this.recuEleve.set(data);
        this.showRecuModal.set(true);
      },
      error: () => this.toastService.error('Impossible de charger le reçu'),
    });
  }

  // ===== Salaires =====

  onPaySalaire(row: SalaireSuivi): void {
    this.prefillEmployeId.set(row.employeId);
    this.showPaiementSalaireModal.set(true);
  }

  onPaiementSalaireSaved(): void {
    this.showPaiementSalaireModal.set(false);
    this.prefillEmployeId.set(null);
    this.refreshKey.update((v) => v + 1);
  }

  onReceiptSalaire(paiementId: number): void {
    this.paiementSalaireService.getReceiptData(paiementId).subscribe({
      next: (data) => {
        this.recuKind.set('salaire');
        this.recuSalaire.set(data);
        this.showRecuModal.set(true);
      },
      error: () => this.toastService.error('Impossible de charger le reçu'),
    });
  }

  onRecuClosed(): void {
    this.showRecuModal.set(false);
    this.recuEleve.set(null);
    this.recuSalaire.set(null);
  }
}