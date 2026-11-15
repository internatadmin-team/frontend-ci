import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Depense, CreateDepenseRequest } from '../models/finance.model';
import { PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class DepenseService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(year?: number, month?: number, categorieId?: number): Observable<Depense[]> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    if (categorieId != null) params = params.set('categorieId', categorieId);
    return this.http.get<Depense[]>(this.apiConfig.getUrl('/depenses'), { params });
  }

  create(data: CreateDepenseRequest, confirmDuplicate = false): Observable<Depense> {
    return this.http.post<Depense>(this.apiConfig.getUrl('/depenses'), { ...data, confirmDuplicate });
  }

  cancel(id: number): Observable<Depense> {
    return this.http.patch<Depense>(this.apiConfig.getUrl(`/depenses/${id}/cancel`), {});
  }

  printReceipt(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/depenses/${id}/print-receipt`), {});
  }

  getReceiptData(id: number): Observable<Depense> {
    return this.http.get<Depense>(this.apiConfig.getUrl(`/depenses/${id}/receipt-data`));
  }
}