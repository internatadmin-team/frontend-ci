import { Component, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PrintHeaderComponent } from '../../../../shared/components/print-header/print-header.component';
import { EmployeService } from '../../../../core/services/employe.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Employe } from '../../../../core/models/employe.model';
import {
  EmployeStatus,
  EMPLOYE_STATUS_LABELS,
  EMPLOYE_FUNCTION_LABELS,
  CONTRACT_TYPE_LABELS,
} from '../../../../core/models/common.model';

@Component({
  selector: 'app-employe-details',
  standalone: true,
  imports: [CommonModule, IconComponent, StatusBadgeComponent, PrintHeaderComponent],
  templateUrl: './employe-details.component.html',
})
export class EmployeDetailsComponent {
  employe = input.required<Employe>();
  editRequested = output<Employe>();
  statusChanged = output<Employe>();

  private employeService = inject(EmployeService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  changingStatus = signal(false);
  printMode = signal<'certificat' | 'carte' | null>(null);

  statusLabels = EMPLOYE_STATUS_LABELS;
  functionLabels = EMPLOYE_FUNCTION_LABELS;
  contractTypeLabels = CONTRACT_TYPE_LABELS;
  today = new Date().toLocaleDateString('fr-FR');

  otherStatuses = computed<EmployeStatus[]>(() => {
    const all: EmployeStatus[] = ['ACTIF', 'EN_CONGE', 'ANCIEN'];
    return all.filter((s) => s !== this.employe().status);
  });

  async onChangeStatus(newStatus: EmployeStatus): Promise<void> {
    const confirmed = await this.confirmDialog.ask(
      'Changer le statut',
      `Confirmer le passage de "${this.employe().fullName}" au statut "${this.statusLabels[newStatus]}" ?`,
      { danger: newStatus === 'ANCIEN' }
    );
    if (!confirmed) return;

    this.changingStatus.set(true);
    this.employeService.updateStatus(this.employe().id, newStatus).subscribe({
      next: (updated) => {
        this.changingStatus.set(false);
        this.toastService.success('Statut mis à jour');
        this.statusChanged.emit(updated);
      },
      error: () => {
        this.changingStatus.set(false);
        this.toastService.error('Erreur lors du changement de statut');
      },
    });
  }

  onEdit(): void {
    this.editRequested.emit(this.employe());
  }

  printCertificate(): void {
    this.employeService.printCertificate(this.employe().id).subscribe({
      next: () => this.triggerPrint('certificat'),
      error: () => this.toastService.error('Erreur lors de la préparation du certificat'),
    });
  }

  printCard(): void {
    this.employeService.printCard(this.employe().id).subscribe({
      next: () => this.triggerPrint('carte'),
      error: () => this.toastService.error('Erreur lors de la préparation de la carte'),
    });
  }

  private triggerPrint(mode: 'certificat' | 'carte'): void {
    this.printMode.set(mode);
    setTimeout(() => {
      window.print();
      this.printMode.set(null);
    }, 50);
  }
}