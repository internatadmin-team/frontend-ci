import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginBackgroundComponent } from '../login/components/login-background/login-background.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoginBackgroundComponent],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  recoveryCode: string | null = null;

  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  get passwordsMatch(): boolean {
    return this.newPassword?.value === this.confirmPassword?.value;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.passwordForm.invalid) {
      this.loading = false;
      return;
    }
    if (!this.passwordsMatch) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.changePassword({
      currentPassword: this.passwordForm.value.currentPassword!,
      newPassword: this.passwordForm.value.newPassword!,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.recoveryCode) {
          this.recoveryCode = response.recoveryCode;
        } else {
          // Redirection vers login pour forcer reconnexion avec nouveau token
          this.authService.logout();
          window.location.href = '/login';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
      },
    });
  }

  onContinue(): void {
    // Après avoir noté le recovery code, déconnexion et reconnexion
    this.authService.logout();
    window.location.href = '/login';
  }
}