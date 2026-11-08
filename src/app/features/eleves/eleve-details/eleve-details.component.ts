import { Component, input, output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PrintHeaderComponent } from '../../../shared/components/print-header/print-header.component';
import { Enfant } from '../../../core/models/enfant.model';
import { EnfantService } from '../../../core/services/enfant.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { ENFANT_STATUS_LABELS, EnfantStatus } from '../../../core/models/common.model';


@Component({
  selector: 'app-eleve-details',
  standalone: true,
  imports: [CommonModule, IconComponent, StatusBadgeComponent, PrintHeaderComponent],
  templateUrl: './eleve-details.component.html',
})
export class EleveDetailsComponent {
  eleve = input.required<Enfant>();
  editRequested = output<Enfant>();
  statusChanged = output<Enfant>();

  private enfantService = inject(EnfantService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);

  changingStatus = signal(false);
  printMode = signal<'certificat' | 'carte' | null>(null);

  statusLabels = ENFANT_STATUS_LABELS;
  today = new Date().toLocaleDateString('fr-FR');

  otherStatuses = computed<EnfantStatus[]>(() => {
    const all: EnfantStatus[] = ['ACTIF', 'EN_VACANCES', 'SORTI'];
    return all.filter((s) => s !== this.eleve().status);
  });

  async onChangeStatus(newStatus: EnfantStatus): Promise<void> {
    const confirmed = await this.confirmDialog.ask(
      'Changer le statut',
      `Confirmer le passage de "${this.eleve().fullName}" au statut "${this.statusLabels[newStatus]}" ?`,
      { danger: newStatus === 'SORTI' }
    );
    if (!confirmed) return;

    this.changingStatus.set(true);
    this.enfantService.updateStatus(this.eleve().id, newStatus).subscribe({
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
    this.editRequested.emit(this.eleve());
  }

  printCertificate(): void {
    this.enfantService.printCertificate(this.eleve().id).subscribe({
      next: () => this.triggerPrint('certificat'),
      error: () => this.toastService.error('Erreur lors de la préparation du certificat'),
    });
  }

  printCard(): void {
    this.enfantService.printCard(this.eleve().id).subscribe({
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