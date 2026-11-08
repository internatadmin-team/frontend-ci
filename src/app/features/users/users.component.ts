import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/icon/icon.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import type { DataTableColumn } from '../../shared/components/data-table/data-table.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserCredentialsModalComponent } from './components/user-credentials-modal/user-credentials-modal.component';
import { UserManagementService } from '../../core/services/user-management.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { UserSummary, UserStats, CreateUserResponse } from '../../core/models/user-management.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    DataTableComponent,
    ModalComponent,
    StatusBadgeComponent,
    UserFormComponent,
    UserCredentialsModalComponent,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private userManagementService = inject(UserManagementService);
  private confirmDialog = inject(ConfirmDialogService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  users = signal<UserSummary[]>([]);
  stats = signal<UserStats | null>(null);

  showFormModal = signal(false);
  editingUser = signal<UserSummary | null>(null);

  showCredentialsModal = signal(false);
  credentialsResult = signal<CreateUserResponse | null>(null);
  /** Vrai quand l'admin vient de réinitialiser SON PROPRE mot de passe -> déconnexion requise à la fermeture */
  isSelfPasswordReset = signal(false);

  columns = computed<DataTableColumn<UserSummary>[]>(() => [
    { key: 'username', label: 'Nom d\'utilisateur', sortable: true },
    { key: 'fullName', label: 'Nom complet', sortable: true },
    { key: 'role', label: 'Rôle', format: (row) => (row.role === 'ADMIN' ? 'Administrateur' : 'Gestionnaire') },
    { key: 'mustChangePassword', label: 'Doit changer son mot de passe', format: (row) => (row.mustChangePassword ? 'Oui' : 'Non') },
  ]);

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  onAddClick(): void {
    this.editingUser.set(null);
    this.showFormModal.set(true);
  }

  onEditClick(user: UserSummary): void {
    this.editingUser.set(user);
    this.showFormModal.set(true);
  }

  onUserSaved(): void {
    this.showFormModal.set(false);
    this.editingUser.set(null);
    this.loadUsers();
    this.loadStats();
  }

  onUserCreated(result: CreateUserResponse): void {
    this.showFormModal.set(false);
    this.isSelfPasswordReset.set(false);
    this.credentialsResult.set(result);
    this.showCredentialsModal.set(true);
  }

  private isSelf(user: UserSummary): boolean {
    return this.authService.getCurrentUser()?.id === user.id;
  }

  async onResetPassword(user: UserSummary): Promise<void> {
    const self = this.isSelf(user);

    const confirmed = await this.confirmDialog.ask(
      'Réinitialiser le mot de passe',
      self
        ? 'Vous êtes sur le point de réinitialiser votre propre mot de passe. Vous serez déconnecté(e) immédiatement après et devrez vous reconnecter avec le nouveau mot de passe temporaire. Assurez-vous de bien le noter.'
        : `Confirmer la réinitialisation du mot de passe de "${user.fullName}" ? Un nouveau mot de passe temporaire sera généré.`,
      { confirmLabel: 'Réinitialiser', danger: self }
    );
    if (!confirmed) return;

    this.userManagementService.resetPassword(user.id).subscribe({
      next: (result) => {
        this.isSelfPasswordReset.set(self);
        this.credentialsResult.set(result);
        this.showCredentialsModal.set(true);
      },
      error: () => this.toastService.error('Erreur lors de la réinitialisation du mot de passe'),
    });
  }

  onCredentialsClosed(): void {
    this.showCredentialsModal.set(false);
    this.credentialsResult.set(null);

    if (this.isSelfPasswordReset()) {
      this.isSelfPasswordReset.set(false);
      this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.loadUsers();
    this.loadStats();
  }

  async onToggleActive(user: UserSummary): Promise<void> {
    const action = user.active ? 'désactiver' : 'activer';
    const confirmed = await this.confirmDialog.ask(
      user.active ? 'Désactiver ce compte' : 'Activer ce compte',
      `Confirmer l'action : ${action} le compte de "${user.fullName}" ?`,
      { danger: user.active, confirmLabel: user.active ? 'Désactiver' : 'Activer' }
    );
    if (!confirmed) return;

    const request$ = user.active
      ? this.userManagementService.deactivate(user.id)
      : this.userManagementService.activate(user.id);

    request$.subscribe({
      next: () => {
        this.toastService.success(`Compte ${user.active ? 'désactivé' : 'activé'}`);
        this.loadUsers();
        this.loadStats();
      },
      error: () => this.toastService.error(`Erreur lors de l'action sur le compte`),
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userManagementService.list().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger la liste des utilisateurs');
      },
    });
  }

  private loadStats(): void {
    this.userManagementService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {},
    });
  }
}