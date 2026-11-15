import { Component, input, output, HostListener } from '@angular/core';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  open = input.required<boolean>();
  title = input<string>('');
  maxWidth = input<string>('32rem');

  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
} 