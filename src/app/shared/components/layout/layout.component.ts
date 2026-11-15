import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EtablissementService } from '../../../core/services/etablissement.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent, ConfirmDialogComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private etablissementService = inject(EtablissementService);

  // Fermée par défaut sur mobile/tablette, ouverte par défaut sur desktop
  sidebarOpen = signal(window.innerWidth >= 1024);

  /** Sur mobile, la sidebar est un overlay : le contenu ne doit jamais lui laisser de marge */
  mainClasses = computed(() => {
    const desktopMargin = this.sidebarOpen() ? 'lg:ml-[280px]' : 'lg:ml-[72px]';
    return `min-h-screen flex flex-col transition-all duration-300 ${desktopMargin}`;
  });

  ngOnInit(): void {
    this.etablissementService.ensureLoaded();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}