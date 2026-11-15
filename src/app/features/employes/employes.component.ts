import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmployeFormComponent } from './components/employe-form/employe-form.component';
import { EmployeDetailsComponent } from './components/employe-details/employe-details.component';
import { EmployeService } from '../../core/services/employe.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { Employe, EmployeStats } from '../../core/models/employe.model';
import {
  EmployeStatus,
  EMPLOYE_STATUS_LABELS,
  EMPLOYE_FUNCTION_LABELS,
  CONTRACT_TYPE_LABELS,
} from '../../core/models/common.model';


type StatusTab = EmployeStatus | 'TOUS';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, IconComponent, DataTableComponent, ModalComponent, EmployeFormComponent, EmployeDetailsComponent],
  templateUrl: './employes.component.html',
})
export class EmployesComponent implements OnInit {
  private employeService = inject(EmployeService);
  private toastService = inject(ToastService);

  loading = signal(true);
  employes = signal<Employe[]>([]);
  stats = signal<EmployeStats | null>(null);
  activeTab = signal<StatusTab>('TOUS');

  showFormModal = signal(false);
  editingEmploye = signal<Employe | null>(null);

  showDetailsModal = signal(false);
  selectedEmploye = signal<Employe | null>(null);

  statusLabels = EMPLOYE_STATUS_LABELS;

  tabs: { value: StatusTab; label: string }[] = [
    { value: 'TOUS', label: 'Tous' },
    { value: 'ACTIF', label: 'Actifs' },
    { value: 'EN_CONGE', label: 'En congé' },
    { value: 'ANCIEN', label: 'Anciens' },
  ];

  columns = computed<DataTableColumn<Employe>[]>(() => [
    { key: 'matricule', label: 'Matricule', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    { key: 'function', label: 'Fonction', sortable: true, format: (row) => EMPLOYE_FUNCTION_LABELS[row.function] },
    { key: 'contractType', label: 'Contrat', format: (row) => CONTRACT_TYPE_LABELS[row.contractType] },
    { key: 'phone', label: 'Téléphone' },
    { key: 'status', label: 'Statut', format: (row) => this.statusLabels[row.status] },
    {
      key: 'baseSalary',
      label: 'Salaire de base',
      align: 'right',
      sortable: true,
      format: (row) => this.formatFcfa(row.baseSalary),
    },
  ]);

  ngOnInit(): void {
    this.loadEmployes();
    this.loadStats();
  }

  onTabChange(tab: StatusTab): void {
    this.activeTab.set(tab);
    this.loadEmployes();
  }

  onAddClick(): void {
    this.editingEmploye.set(null);
    this.showFormModal.set(true);
  }

  onRowClick(employe: Employe): void {
    this.selectedEmploye.set(employe);
    this.showDetailsModal.set(true);
  }

  onEditClick(employe: Employe): void {
    this.editingEmploye.set(employe);
    this.showFormModal.set(true);
  }

  onEditFromDetails(employe: Employe): void {
    this.showDetailsModal.set(false);
    this.editingEmploye.set(employe);
    this.showFormModal.set(true);
  }

  onFormSaved(): void {
    this.showFormModal.set(false);
    this.editingEmploye.set(null);
    this.loadEmployes();
    this.loadStats();
  }

  onStatusChanged(updated: Employe): void {
    this.selectedEmploye.set(updated);
    this.loadEmployes();
    this.loadStats();
  }

  private loadEmployes(): void {
    this.loading.set(true);
    const status = this.activeTab() === 'TOUS' ? undefined : (this.activeTab() as EmployeStatus);
    this.employeService.list(status).subscribe({
      next: (data) => {
        this.employes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger la liste des employés');
      },
    });
  }

  private loadStats(): void {
    this.employeService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}, // non bloquant
    });
  }

  private formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }
}