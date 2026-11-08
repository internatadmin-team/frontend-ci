import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PrintHeaderComponent } from '../../../../shared/components/print-header/print-header.component';
import { RecuPaiement, RecuSalaire } from '../../../../core/models/paiement.model';
import { PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS, PaymentMethod, PaymentType } from '../../../../core/models/common.model';

export type RecuKind = 'eleve' | 'salaire';

@Component({
  selector: 'app-paiement-recu',
  standalone: true,
  imports: [CommonModule, IconComponent, PrintHeaderComponent],
  templateUrl: './paiement-recu.component.html',
})
export class PaiementRecuComponent {
  kind = input.required<RecuKind>();
  recuEleve = input<RecuPaiement | null>(null);
  recuSalaire = input<RecuSalaire | null>(null);
  closed = output<void>();

  methodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method];
  }

  typeLabel(type: PaymentType): string {
    return PAYMENT_TYPE_LABELS[type];
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.closed.emit();
  }
}