import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { AuditService } from '../../core/services/audit.service';
import { ToastService } from '../../core/services/toast/toast.service';
import { AuditLog } from '../../core/models/audit.model';
import {
  entityLabel,
  actionLabel,
  actionVariant,
  rowTitle,
  parseDetails,
  ENTITY_TYPE_LABELS,
  DetailField,
} from '../../core/utils/audit-display.util';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './audit.component.html',
})
export class AuditComponent implements OnInit {
  private auditService = inject(AuditService);
  private toastService = inject(ToastService);

  loading = signal(true);
  logs = signal<AuditLog[]>([]);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  isFirst = signal(true);
  isLast = signal(true);

  entityTypeFilter = signal<string>('');
  expandedRowId = signal<number | null>(null);

  entityTypeOptions = Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  readonly pageSize = 20;

  ngOnInit(): void {
    this.load();
  }

  entityLabel = entityLabel;
  actionLabel = actionLabel;
  actionVariant = actionVariant;

  rowTitle(log: AuditLog): string {
    return rowTitle(log.entityType, log.entityId, log.details);
  }

  parseDetails(details: string): DetailField[] {
    return parseDetails(details);
  }

  onEntityTypeChange(value: string): void {
    this.entityTypeFilter.set(value);
    this.page.set(0);
    this.load();
  }

  toggleExpand(logId: number): void {
    this.expandedRowId.update((current) => (current === logId ? null : logId));
  }

  onPreviousPage(): void {
    if (this.isFirst()) return;
    this.page.update((p) => p - 1);
    this.load();
  }

  onNextPage(): void {
    if (this.isLast()) return;
    this.page.update((p) => p + 1);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.auditService.getHistory({
      entityType: this.entityTypeFilter() || undefined,
      page: this.page(),
      size: this.pageSize,
    }).subscribe({
      next: (result) => {
        this.logs.set(result.content);
        this.totalPages.set(result.totalPages);
        this.totalElements.set(result.totalElements);
        this.isFirst.set(result.first);
        this.isLast.set(result.last);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Impossible de charger l\'historique des opérations');
      },
    });
  }
}