import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast/toast.service';
import { IconComponent } from '../../icon/icon.component';


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.activeToasts;

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  }
}