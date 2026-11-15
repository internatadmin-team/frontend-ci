import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

import { EnfantService } from '../../core/services/enfant.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { Enfant, EnfantStats } from '../../core/models/enfant.model';
import { EnfantStatus, ENFANT_STATUS_LABELS } from '../../core/models/common.model';
import { EleveFormComponent } from './eleve-form/eleve-form.component';
import { EleveDetailsComponent } from './eleve-details/eleve-details.component';

type StatusTab = EnfantStatus | 'TOUS';

@Component({
  selector: 'app-eleves',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent, ModalComponent, EleveFormComponent, EleveDetailsComponent],
  templateUrl: './eleves.component.html',
})
export class ElevesComponent implements OnInit {
  private enfantService = inject(EnfantService);
  private toastService = inject(ToastService);

  loading = signal(true);
  eleves = signal<Enfant[]>([]);
  stats = signal<EnfantStats | null>(null);
  activeTab = signal<StatusTab>('TOUS');

  showFormModal = signal(false);
  editingEleve = signal<Enfant | null>(null);

  showDetailsModal = signal(false);
  selectedEleve = signal<Enfant | null>(null);

  statusLabels = ENFANT_STATUS_LABELS;

  tabs: { value: StatusTab; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: 'ACTIF', label: 'Actifs' },
    { value: 'EN_VACANCES', label: 'En vacances' },
    { value: 'SORTI', label: 'Sortis' },
  ];

  columns = computed<DataTableColumn<Enfant>[]>(() => [
    { key: 'matricule', label: 'Matricule', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    { key: 'gender', label: 'Genre', format: (row) => (row.gender === 'M' ? 'Garçon' : 'Fille') },
    { key: 'guardianName', label: 'Tuteur', sortable: true },
    { key: 'guardianPhone', label: 'Téléphone tuteur' },
    { key: 'roomGroup', label: 'Chambre / Groupe' },
    { key: 'status', label: 'Statut', format: (row) => this.statusLabels[row.status] },
    {
      key: 'monthlyFee',
      label: 'Mensualité',
      align: 'right',
      sortable: true,
      format: (row) => this.formatFcfa(row.monthlyFee),
    },
  ]);

  ngOnInit(): void {
    this.loadEleves();
    this.loadStats();
  }

  onTabChange(tab: StatusTab): void {
    this.activeTab.set(tab);
    this.loadEleves();
  }

  onAddClick(): void {
    this.editingEleve.set(null);
    this.showFormModal.set(true);
  }

  onRowClick(eleve: Enfant): void {
    this.selectedEleve.set(eleve);
    this.showDetailsModal.set(true);
  }

  onEditClick(eleve: Enfant): void {
    this.editingEleve.set(eleve);
    this.showFormModal.set(true);
  }

  onEditFromDetails(eleve: Enfant): void {
    this.showDetailsModal.set(false);
    this.editingEleve.set(eleve);
    this.showFormModal.set(true);
  }

  onFormSaved(): void {
    this.showFormModal.set(false);
    this.editingEleve.set(null);
    this.loadEleves();
    this.loadStats();
  }

  onStatusChanged(updated: Enfant): void {
    this.selectedEleve.set(updated);
    this.loadEleves();
    this.loadStats();
  }

  private loadEleves(): void {
    this.loading.set(true);
    const status = this.activeTab() === 'TOUS' ? undefined : (this.activeTab() as EnfantStatus);
    this.enfantService.list(status).subscribe({
      next: (data) => {
        this.eleves.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger la liste des élèves');
      },
    });
  }

  private loadStats(): void {
    this.enfantService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}, // non bloquant
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}