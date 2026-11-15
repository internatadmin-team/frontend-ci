import { Injectable } from '@angular/core';
import { DataTableColumn } from '../../shared/components/data-table/data-table.model';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportToCsv<T extends Record<string, any>>(
    fileName: string,
    columns: DataTableColumn<T>[],
    rows: T[]
  ): void {
    const separator = ';'; // Excel FR utilise le point-virgule comme séparateur
    const header = columns.map(col => this.escapeCsvField(col.label)).join(separator);

    const lines = rows.map(row =>
      columns
        .map(col => {
          const value = col.format ? col.format(row) : row[col.key as string];
          return this.escapeCsvField(value == null ? '' : value.toString());
        })
        .join(separator)
    );

    const csvContent = [header, ...lines].join('\r\n');

    // BOM UTF-8 pour que les accents s'affichent correctement dans Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${fileName}.csv`);
  }

  printAsPdf(): void {
    window.print();
  }

  private escapeCsvField(value: string): string {
    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}