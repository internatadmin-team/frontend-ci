import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  @Output() loginSubmit = new EventEmitter<{ username: string; password: string }>();

  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = false;
  submitted = false;
  errorMessage = '';

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loading) return; // ← BLOCAGE ANTI-DOUBLE-SUBMIT

    this.submitted = true;
    this.errorMessage = '';

    console.log('Valeurs du formulaire :', this.loginForm.value);
    console.log('État du formulaire :', this.loginForm.status);
    console.log('Erreurs du mot de passe :', this.password?.errors);

    if (this.loginForm.invalid) {
  return;
}

    this.loading = true;
    this.loginSubmit.emit({
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    });
  }

  setError(message: string): void {
    this.loading = false;
    this.errorMessage = message;
  }

  reset(): void {
    this.loading = false;
    this.submitted = false;
    this.errorMessage = '';
    this.loginForm.reset();
  }
}
