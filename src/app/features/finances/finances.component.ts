import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DepensesListComponent } from './components/depenses-list/depenses-list.component';
import { DepenseFormComponent } from './components/depense-form/depense-form.component';
import { CategoriesDepensesModalComponent } from './components/categories-depenses-modal/categories-depenses-modal.component';
import { RecettesListComponent } from './components/recettes-list/recettes-list.component';
import { RecetteFormComponent } from './components/recette-form/recette-form.component';
import { TresorerieViewComponent } from './components/tresorerie-view/tresorerie-view.component';
import { FinanceRecuComponent, FinanceRecuKind } from './components/finance-recu/finance-recu.component';
import { DepenseService } from '../../core/services/depense.service';
import { AutreRecetteService } from '../../core/services/autre-recette.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { Depense, AutreRecette } from '../../core/models/finance.model';

type MainTab = 'depenses' | 'recettes' | 'tresorerie';

const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ModalComponent,
    DepensesListComponent,
    DepenseFormComponent,
    CategoriesDepensesModalComponent,
    RecettesListComponent,
    RecetteFormComponent,
    TresorerieViewComponent,
    FinanceRecuComponent,
  ],
  templateUrl: './finances.component.html',
})
export class FinancesComponent {
  private depenseService = inject(DepenseService);
  private autreRecetteService = inject(AutreRecetteService);
  private toastService = inject(ToastService);

mainTab = signal<MainTab>('tresorerie');

  today = new Date();
  year = signal(this.today.getFullYear());
  month = signal(this.today.getMonth() + 1);
  moisOptions = MOIS_FR.map((label, index) => ({ value: index + 1, label }));

  showDepenseModal = signal(false);
  showCategoriesModal = signal(false);
  showRecetteModal = signal(false);

  showRecuModal = signal(false);
  recuKind = signal<FinanceRecuKind>('depense');
  recuDepense = signal<Depense | null>(null);
  recuRecette = signal<AutreRecette | null>(null);

  refreshKey = signal(0);

  onMainTabChange(tab: MainTab): void {
    this.mainTab.set(tab);
  }

  onYearChange(value: number): void {
    this.year.set(value);
  }

  onMonthChange(value: number): void {
    this.month.set(value);
  }

  onDepenseSaved(): void {
    this.showDepenseModal.set(false);
    this.refreshKey.update((v) => v + 1);
  }

  onRecetteSaved(): void {
    this.showRecetteModal.set(false);
    this.refreshKey.update((v) => v + 1);
  }

  onDepenseReceipt(id: number): void {
    this.depenseService.getReceiptData(id).subscribe({
      next: (data) => {
        this.recuKind.set('depense');
        this.recuDepense.set(data);
        this.showRecuModal.set(true);
      },
      error: () => this.toastService.error('Impossible de charger le reçu'),
    });
  }

  onRecetteReceipt(id: number): void {
    this.autreRecetteService.getReceiptData(id).subscribe({
      next: (data) => {
        this.recuKind.set('recette');
        this.recuRecette.set(data);
        this.showRecuModal.set(true);
      },
      error: () => this.toastService.error('Impossible de charger le reçu'),
    });
  }

  onRecuClosed(): void {
    this.showRecuModal.set(false);
    this.recuDepense.set(null);
    this.recuRecette.set(null);
  }
}