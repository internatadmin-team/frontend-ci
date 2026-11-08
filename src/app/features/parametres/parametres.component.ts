import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';
import { ParametresService } from '../../core/services/parametres.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { Parametres } from '../../core/models/parametres.model';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  templateUrl: './parametres.component.html',
})
export class ParametresComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private parametresService = inject(ParametresService);
  private toastService = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  logoSrc = signal<string | null>(null);
  uploadingLogo = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    address: [''],
    phone: [''],
    email: [''],
    directorName: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    // Libère la mémoire de l'URL objet créée pour le logo (bon réflexe sur appareils faibles)
    const current = this.logoSrc();
    if (current) URL.revokeObjectURL(current);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.parametresService.update({
      name: value.name!,
      address: value.address || undefined,
      phone: value.phone || undefined,
      email: value.email || undefined,
      directorName: value.directorName || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Paramètres enregistrés avec succès');
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Erreur lors de l\'enregistrement des paramètres');
      },
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingLogo.set(true);
    this.parametresService.uploadLogo(file).subscribe({
      next: () => {
        this.uploadingLogo.set(false);
        this.toastService.success('Logo mis à jour avec succès');
        this.loadLogo();
      },
      error: () => {
        this.uploadingLogo.set(false);
        this.toastService.error('Erreur lors de l\'envoi du logo');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.parametresService.get().subscribe({
      next: (data: Parametres) => {
        this.form.patchValue({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          directorName: data.directorName,
        });
        this.loading.set(false);
        if (data.hasLogo) this.loadLogo();
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger les paramètres');
      },
    });
  }

  private loadLogo(): void {
    this.parametresService.getLogoBlob().subscribe({
      next: (blob) => {
        // Libère l'ancienne URL avant d'en créer une nouvelle (évite une fuite mémoire)
        const previous = this.logoSrc();
        if (previous) URL.revokeObjectURL(previous);

        this.logoSrc.set(URL.createObjectURL(blob));
      },
      error: () => {}, // non bloquant
    });
  }
}