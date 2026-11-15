import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
  PaiementSalaire,
  CreatePaiementSalaireRequest,
  RecuSalaire,
  SalaireSuivi,
  SuiviStatusFilter,
} from '../models/paiement.model';
import { PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class PaiementSalaireService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  getSuivi(year?: number, month?: number, status: SuiviStatusFilter = 'ALL'): Observable<SalaireSuivi[]> {
    let params = new HttpParams().set('status', status);
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    return this.http.get<SalaireSuivi[]>(this.apiConfig.getUrl('/paiements-salaires'), { params });
  }

  create(data: CreatePaiementSalaireRequest): Observable<PaiementSalaire> {
    return this.http.post<PaiementSalaire>(this.apiConfig.getUrl('/paiements-salaires'), data);
  }

  cancel(id: number): Observable<PaiementSalaire> {
    return this.http.patch<PaiementSalaire>(this.apiConfig.getUrl(`/paiements-salaires/${id}/cancel`), {});
  }

  printReceipt(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/paiements-salaires/${id}/print-receipt`), {});
  }

  getReceiptData(id: number): Observable<RecuSalaire> {
    return this.http.get<RecuSalaire>(this.apiConfig.getUrl(`/paiements-salaires/${id}/receipt-data`));
  }

  getHistorique(employeId: number): Observable<PaiementSalaire[]> {
    return this.http.get<PaiementSalaire[]>(this.apiConfig.getUrl(`/paiements-salaires/employe/${employeId}`));
  }
}