import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private request = signal<ConfirmRequest | null>(null);
  private resolver: ((value: boolean) => void) | null = null;

  readonly current = this.request.asReadonly();

  ask(
    title: string,
    message: string,
    options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean }
  ): Promise<boolean> {
    this.request.set({
      title,
      message,
      confirmLabel: options?.confirmLabel ?? 'Confirmer',
      cancelLabel: options?.cancelLabel ?? 'Annuler',
      danger: options?.danger ?? false,
    });

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  respond(value: boolean): void {
    this.resolver?.(value);
    this.resolver = null;
    this.request.set(null);
  }
}