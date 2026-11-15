import { Component, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { TresorerieService } from '../../../../core/services/tresorerie.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Tresorerie } from '../../../../core/models/finance.model';

@Component({
  selector: 'app-tresorerie-view',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './tresorerie-view.component.html',
})
export class TresorerieViewComponent {
  year = input.required<number>();
  month = input.required<number>();

  private tresorerieService = inject(TresorerieService);
  private toastService = inject(ToastService);

  loading = signal(true);
  data = signal<Tresorerie | null>(null);

  constructor() {
    effect(() => {
      this.year();
      this.month();
      this.load();
    });
  }

  formatFcfa(value: number): string {
    return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} FCFA`;
  }

  private load(): void {
    this.loading.set(true);
    this.tresorerieService.get(this.year(), this.month()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger la trésorerie');
      },
    });
  }
}