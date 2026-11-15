import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-recovery-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recovery-form.component.html',
})
export class RecoveryFormComponent {
  @Output() back = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  recoveryForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    recoveryCode: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  loading = false;
  submitted = false;
  errorMessage = '';
  newRecoveryCode: string | null = null;

  get username() { return this.recoveryForm.get('username'); }
  get recoveryCode() { return this.recoveryForm.get('recoveryCode'); }
  get newPassword() { return this.recoveryForm.get('newPassword'); }
  get confirmPassword() { return this.recoveryForm.get('confirmPassword'); }

  get passwordsMatch(): boolean {
    return this.newPassword?.value === this.confirmPassword?.value;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.recoveryForm.invalid) {
      this.loading = false;
      return;
    }
    if (!this.passwordsMatch) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.resetWithRecoveryCode({
      username: this.recoveryForm.value.username!,
      recoveryCode: this.recoveryForm.value.recoveryCode!,
      newPassword: this.recoveryForm.value.newPassword!,
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.newRecoveryCode = response.newRecoveryCode;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Code de recuperation incorrect';
      },
    });
  }

  onContinue(): void {
    this.success.emit();
  }

  reset(): void {
    this.loading = false;
    this.submitted = false;
    this.errorMessage = '';
    this.newRecoveryCode = null;
    this.recoveryForm.reset();
  }
}