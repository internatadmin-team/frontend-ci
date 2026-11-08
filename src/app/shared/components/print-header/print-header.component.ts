import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtablissementService } from '../../../core/services/etablissement.service';

@Component({
  selector: 'app-print-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-header.component.html',
})
export class PrintHeaderComponent {
  private etablissementService = inject(EtablissementService);

  infos = this.etablissementService.infos;
  logoSrc = this.etablissementService.logoSrc;
}