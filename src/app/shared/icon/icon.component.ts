import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconService } from '../../core/services/icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span class="inline-flex" [innerHTML]="svg()"></span>`,
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);
  private iconService = inject(IconService);

  name = input.required<string>();
  size = input<string>('w-5 h-5');

  svg = computed<SafeHtml>(() => {
    const path = this.iconService.getPath(this.name());
    const markup = `<svg class="${this.size()}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${path}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}