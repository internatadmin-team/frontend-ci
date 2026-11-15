import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { PaiementEnfantService } from '../../core/services/paiement-enfant.service';
import { TresorerieService } from '../../core/services/tresorerie.service';
import { AuditService } from '../../core/services/audit.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { GlobalDashboard } from '../../core/models/dashboard.model';
import { SuiviMensuel } from '../../core/models/paiement.model';
import { LigneDetail } from '../../core/models/finance.model';
import { AuditLog } from '../../core/models/audit.model';
import { entityLabel, actionLabel, actionVariant, rowTitle } from '../../core/utils/audit-display.util';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: 'green' | 'blue' | 'gold' | 'orange';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private paiementEnfantService = inject(PaiementEnfantService);
  private tresorerieService = inject(TresorerieService);
  private auditService = inject(AuditService);
  private toastService = inject(ToastService);

  loading = signal(true);
  dashboard = signal<GlobalDashboard | null>(null);

  stats = computed<StatCard[]>(() => {
    const data = this.dashboard();
    if (!data) return [];

    return [
      { label: 'Élèves actifs', value: data.nombreEnfantsActifs.toString(), icon: 'baby', color: 'green' },
      { label: 'Employés actifs', value: data.nombreEmployesActifs.toString(), icon: 'briefcase', color: 'blue' },
      { label: 'Total recettes', value: this.formatFcfa(data.totalRecettes), icon: 'wallet', color: 'gold' },
      { label: 'Total dépenses', value: this.formatFcfa(data.totalDepenses), icon: 'receipt', color: 'orange' },
      { label: 'Solde disponible', value: this.formatFcfa(data.soldeDisponible), icon: 'trending-up', color: 'blue' },
    ];
  });

  quickAccess = [
    { label: 'Élèves', route: '/eleves', icon: 'baby' },
    { label: 'Employés', route: '/employes', icon: 'briefcase' },
    { label: 'Paiements', route: '/paiements', icon: 'receipt' },
    { label: 'Utilisateurs', route: '/users', icon: 'users' },
  ];

  // ===== Widget : impayés à traiter (mois courant) =====
  impayesLoading = signal(true);
  impayes = signal<SuiviMensuel[]>([]);
  impayesTotalCount = signal(0);

  // ===== Widget : répartition des dépenses (mois courant) =====
  depensesLoading = signal(true);
  depensesDetail = signal<LigneDetail[]>([]);
  depensesMaxMontant = computed(() => Math.max(1, ...this.depensesDetail().map((d) => d.montant)));

  // ===== Widget : activité récente =====
  activityLoading = signal(true);
  activityLogs = signal<AuditLog[]>([]);

  entityLabel = entityLabel;
  actionLabel = actionLabel;
  actionVariant = actionVariant;

  rowTitle(log: AuditLog): string {
    return rowTitle(log.entityType, log.entityId, log.details);
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadImpayes();
    this.loadDepensesRepartition();
    this.loadActivity();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.dashboardService.get().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les données du tableau de bord');
      },
    });
  }

  private loadImpayes(): void {
    const now = new Date();
    this.impayesLoading.set(true);
    this.paiementEnfantService.getMensualites(now.getFullYear(), now.getMonth() + 1, 'IMPAYE').subscribe({
      next: (data) => {
        this.impayesTotalCount.set(data.length);
        this.impayes.set(data.slice(0, 5));
        this.impayesLoading.set(false);
      },
      error: () => {
        this.impayesLoading.set(false);
      },
    });
  }

  private loadDepensesRepartition(): void {
    const now = new Date();
    this.depensesLoading.set(true);
    this.tresorerieService.get(now.getFullYear(), now.getMonth() + 1).subscribe({
      next: (data) => {
        this.depensesDetail.set(
          [...data.detailDepenses].sort((a, b) => b.montant - a.montant).slice(0, 5)
        );
        this.depensesLoading.set(false);
      },
      error: () => {
        this.depensesLoading.set(false);
      },
    });
  }

  private loadActivity(): void {
    this.activityLoading.set(true);
    this.auditService.getMyRecentActivity(0, 5).subscribe({
      next: (result) => {
        this.activityLogs.set(result.content);
        this.activityLoading.set(false);
      },
      error: () => {
        this.activityLoading.set(false);
      },
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }

  formatFcfaPublic(value: number): string {
    return this.formatFcfa(value);
  }

  /**
   * Retourne les classes Tailwind pour la taille de police selon la longueur du nombre.
   * @param value - Chaîne formatée (ex: "1 234 567 FCFA")
   */
getFontSize(value: string): string {
  const digits = value.replace(/\s/g, '').replace('FCFA', '').trim();
  const length = digits.length;

  if (length > 15) return 'text-xs sm:text-sm';
  if (length > 12) return 'text-sm sm:text-base';
  if (length > 10) return 'text-base sm:text-lg';
  if (length > 8)  return 'text-lg sm:text-xl';
  if (length > 6)  return 'text-xl sm:text-2xl';
  return 'text-2xl sm:text-3xl';
}
}