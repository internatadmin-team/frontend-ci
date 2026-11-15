import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { PrintHeaderComponent } from '../../../../shared/components/print-header/print-header.component';
import { Depense, AutreRecette } from '../../../../core/models/finance.model';

export type FinanceRecuKind = 'depense' | 'recette';

@Component({
  selector: 'app-finance-recu',
  standalone: true,
  imports: [CommonModule, IconComponent, PrintHeaderComponent],
  templateUrl: './finance-recu.component.html',
})
export class FinanceRecuComponent {
  kind = input.required<FinanceRecuKind>();
  depense = input<Depense | null>(null);
  recette = input<AutreRecette | null>(null);
  closed = output<void>();

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.closed.emit();
  }
}