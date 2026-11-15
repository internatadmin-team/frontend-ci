import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  private confirmDialogService = inject(ConfirmDialogService);
  request = this.confirmDialogService.current;

  confirm(): void {
    this.confirmDialogService.respond(true);
  }

  cancel(): void {
    this.confirmDialogService.respond(false);
  }
} 