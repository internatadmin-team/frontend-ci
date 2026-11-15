import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icon/icon.component';

@Component({
  selector: 'app-user-credentials-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './user-credentials-modal.component.html',
})
export class UserCredentialsModalComponent {
  username = input.required<string>();
  temporaryPassword = input.required<string>();
  fullName = input.required<string>();
  /** Affiche un avertissement de déconnexion imminente quand vrai */
  willLogout = input<boolean>(false);
  closed = output<void>();

  onContinue(): void {
    this.closed.emit();
  }
}