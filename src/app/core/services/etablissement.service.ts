import { Injectable, inject, signal } from '@angular/core';
import { ParametresService } from './parametres.service';
import { Parametres } from '../models/parametres.model';

@Injectable({ providedIn: 'root' })
export class EtablissementService {
  private parametresService = inject(ParametresService);

  private infosSignal = signal<Parametres | null>(null);
  private logoSrcSignal = signal<string | null>(null);
  private loaded = false;

  readonly infos = this.infosSignal.asReadonly();
  readonly logoSrc = this.logoSrcSignal.asReadonly();

  /** Charge les paramètres une seule fois par session ; les appels suivants sont des no-op */
  ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;

    this.parametresService.get().subscribe({
      next: (data) => {
        this.infosSignal.set(data);
        if (data.hasLogo) this.loadLogo();
      },
      error: () => {
        this.loaded = false; // permet de réessayer si le premier appel a échoué
      },
    });
  }

  private loadLogo(): void {
    this.parametresService.getLogoBlob().subscribe({
      next: (blob) => this.logoSrcSignal.set(URL.createObjectURL(blob)),
      error: () => {},
    });
  }
}