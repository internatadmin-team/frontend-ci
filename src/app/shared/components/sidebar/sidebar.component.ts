import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EtablissementService } from '../../../core/services/etablissement.service';
import { IconComponent } from '../../icon/icon.component';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private etablissementService = inject(EtablissementService);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  etablissementNom = computed(() => this.etablissementService.infos()?.name);

  /**
   * Mobile : hors écran par défaut, plein overlay quand ouverte (ne pousse jamais le contenu).
   * Desktop (lg:) : toujours visible, largeur 72px repliée / 280px ouverte, comme avant.
   */
  asideClasses = computed(() => {
    const mobileVisibility = this.isOpen() ? 'translate-x-0' : '-translate-x-full';
    const desktopWidth = this.isOpen() ? 'lg:w-[280px]' : 'lg:w-[72px]';
    return `w-[280px] ${mobileVisibility} lg:translate-x-0 ${desktopWidth}`;
  });

  private allNavItems: NavItem[] = [
    { label: 'Tableau de bord', route: '/dashboard', icon: 'dashboard' },
    { label: 'Eleves', route: '/eleves', icon: 'baby' },
    { label: 'Employes', route: '/employes', icon: 'briefcase' },
    { label: 'Paiements', route: '/paiements', icon: 'receipt' },
    { label: 'Finances', route: '/finances', icon: 'wallet' },
    { label: 'Audit', route: '/audit', icon: 'clipboard', adminOnly: true },
    { label: 'Utilisateurs', route: '/users', icon: 'users', adminOnly: true },
    { label: 'Paramètres', route: '/parametres', icon: 'settings', adminOnly: true },
  ];

  navItems = computed<NavItem[]>(() => {
    const isAdmin = this.authService.getCurrentUser()?.role === 'ADMIN';
    return this.allNavItems.filter((item) => !item.adminOnly || isAdmin);
  });

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  onNavClick(): void {
    if (window.innerWidth < 1024) {
      this.closeSidebar.emit();
    }
  }
}