import { Component, ViewChild, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginBackgroundComponent } from './components/login-background/login-background.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RecoveryFormComponent } from './components/recovery-form/recovery-form.component';
import { AuthService } from '../../../core/services/auth.service';

type LoginView = 'welcome' | 'login' | 'recovery';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginBackgroundComponent, LoginFormComponent, RecoveryFormComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  @ViewChild(LoginFormComponent) loginFormComponent!: LoginFormComponent;
  @ViewChild(RecoveryFormComponent) recoveryFormComponent!: RecoveryFormComponent;

  private authService = inject(AuthService);
  private router = inject(Router);

  view: LoginView = 'welcome';

  showLogin(): void {
    this.view = 'login';
  }

  showRecovery(): void {
    this.view = 'recovery';
  }

  showWelcome(): void {
    this.view = 'welcome';
    this.loginFormComponent?.reset();
    this.recoveryFormComponent?.reset();
  }

  onContainerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if ((this.view === 'login' || this.view === 'recovery') && target.closest('.rounded-2xl') === null) {
      this.showWelcome();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.view === 'login' || this.view === 'recovery') {
      this.showWelcome();
    }
  }

  onLogin(credentials: { username: string; password: string }): void {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.mustChangePassword) {
          this.router.navigate(['/change-password'], { replaceUrl: true });
        } else {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.loginFormComponent?.setError(
          err.error?.message || 'Identifiants incorrects'
        );
      },
    });
  }

  onRecoverySuccess(): void {
    this.view = 'welcome';
  }
}