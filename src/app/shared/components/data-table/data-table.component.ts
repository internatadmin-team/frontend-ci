import { Component, input, output, contentChild, TemplateRef, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { PrintHeaderComponent } from '../print-header/print-header.component';
import { ExportService } from '../../../core/services/export.service';
import type { DataTableColumn } from './data-table.model';

export type { DataTableColumn };

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, IconComponent, PrintHeaderComponent],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T extends Record<string, any>> implements OnInit {
  private exportService = inject(ExportService);

  columns = input.required<DataTableColumn<T>[]>();
  data = input.required<T[]>();
  pageSize = input<number>(10);
  searchable = input<boolean>(true);
  exportable = input<boolean>(true);
  exportFileName = input<string>('export');
  printTitle = input<string>('');
  emptyMessage = input<string>('Aucune donnée à afficher');

  defaultSortKey = input<string | null>(null);
  defaultSortDirection = input<'asc' | 'desc'>('desc');

  rowClick = output<T>();

  actionsTemplate = contentChild<TemplateRef<{ $implicit: T }>>('actions');

  searchTerm = signal('');
  currentPage = signal(1);
  sortKey = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  /** N'existe dans la page QUE pendant l'impression — jamais avant, jamais après */
  printing = signal(false);

  ngOnInit(): void {
    this.sortKey.set(this.defaultSortKey());
    this.sortDirection.set(this.defaultSortDirection());
  }

  filteredData = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    let rows = this.data();

    if (term) {
      rows = rows.filter((row) =>
        this.columns().some((col) => this.getCellValue(row, col).toLowerCase().includes(term))
      );
    }

    const key = this.sortKey();
    if (key) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const va = a[key];
        const vb = b[key];
        if (va == null && vb == null) return 0;
        if (va == null) return -1 * dir;
        if (vb == null) return 1 * dir;
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return va.toString().localeCompare(vb.toString()) * dir;
      });
    }

    return rows;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredData().length / this.pageSize())));

  pagedData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  onSort(column: DataTableColumn<T>): void {
    if (!column.sortable) return;
    const key = column.key as string;
    if (this.sortKey() === key) {
      this.sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  getCellValue(row: T, column: DataTableColumn<T>): string {
    if (column.format) return column.format(row);
    const value = row[column.key as string];
    return value == null ? '' : value.toString();
  }

  onExportCsv(): void {
    this.exportService.exportToCsv(this.exportFileName(), this.columns(), this.filteredData());
  }

  onExportPdf(): void {
    this.printing.set(true);
    setTimeout(() => {
      this.exportService.printAsPdf();
      this.printing.set(false);
    }, 50);
  }

  displayTitle(): string {
    if (this.printTitle()) return this.printTitle();
    return this.exportFileName().replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}