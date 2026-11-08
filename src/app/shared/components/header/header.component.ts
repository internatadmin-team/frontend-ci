import { Component, inject, output, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/notification.model';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  toggleSidebar = output<void>();
  user = this.authService.currentUser$;

  notifications = signal<NotificationItem[]>([]);
  notificationsLoading = signal(false);
  panelOpen = signal(false);

  totalCount = computed(() =>
    this.notifications().reduce((sum, n) => sum + (n.count || 1), 0)
  );

  constructor() {
    this.loadNotifications();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  togglePanel(): void {
    const willOpen = !this.panelOpen();
    this.panelOpen.set(willOpen);
    if (willOpen) {
      this.loadNotifications();
    }
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
  }

  severityIcon(severity: string): string {
    switch (severity.toUpperCase()) {
      case 'ERROR': return 'alert-circle';
      case 'WARNING': return 'alert-triangle';
      default: return 'info';
    }
  }

  severityVariant(severity: string): 'error' | 'warning' | 'info' {
    switch (severity.toUpperCase()) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      default: return 'info';
    }
  }

  private loadNotifications(): void {
    this.notificationsLoading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (items) => {
        this.notifications.set(items);
        this.notificationsLoading.set(false);
      },
      error: () => {
        this.notificationsLoading.set(false);
      },
    });
  }
}