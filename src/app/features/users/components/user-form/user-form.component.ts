import { Component, input, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserManagementService } from '../../../../core/services/user-management.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { UserSummary, CreateUserResponse } from '../../../../core/models/user-management.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  user = input<UserSummary | null>(null);

  saved = output<void>();
  created = output<CreateUserResponse>();
  cancelled = output<void>();

  private fb = inject(FormBuilder);
  private userManagementService = inject(UserManagementService);
  private toastService = inject(ToastService);

  loading = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
  });

  get isEditMode(): boolean {
    return this.user() != null;
  }

  ngOnInit(): void {
    const current = this.user();
    if (current) {
      const [firstName, ...rest] = current.fullName.split(' ');
      this.form.patchValue({ firstName, lastName: rest.join(' ') });
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    const value = this.form.getRawValue();

    if (this.isEditMode) {
      this.userManagementService.update(this.user()!.id, {
        firstName: value.firstName!,
        lastName: value.lastName!,
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.toastService.success('Utilisateur modifié avec succès');
          this.saved.emit();
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Erreur lors de la modification de l\'utilisateur');
        },
      });
      return;
    }

    this.userManagementService.create({
      firstName: value.firstName!,
      lastName: value.lastName!,
    }).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.created.emit(result);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erreur lors de la création de l\'utilisateur');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}