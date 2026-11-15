import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  public readonly activeToasts = this.toasts.asReadonly();
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 4000): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };
    
    this.toasts.update(current => [...current, toast]);
    
    setTimeout(() => this.remove(toast.id), duration);
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}