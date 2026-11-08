import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
  PaiementEnfant,
  CreatePaiementEnfantRequest,
  RecuPaiement,
  SuiviMensuel,
  InscriptionSuivi,
  SuiviStatusFilter,
} from '../models/paiement.model';
import { PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class PaiementEnfantService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  create(data: CreatePaiementEnfantRequest): Observable<PaiementEnfant> {
    return this.http.post<PaiementEnfant>(this.apiConfig.getUrl('/paiements-enfants'), data);
  }

  cancel(id: number): Observable<PaiementEnfant> {
    return this.http.patch<PaiementEnfant>(this.apiConfig.getUrl(`/paiements-enfants/${id}/cancel`), {});
  }

  printReceipt(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/paiements-enfants/${id}/print-receipt`), {});
  }

  getReceiptData(id: number): Observable<RecuPaiement> {
    return this.http.get<RecuPaiement>(this.apiConfig.getUrl(`/paiements-enfants/${id}/receipt-data`));
  }

  getMensualites(year?: number, month?: number, status: SuiviStatusFilter = 'ALL'): Observable<SuiviMensuel[]> {
    let params = new HttpParams().set('status', status);
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    return this.http.get<SuiviMensuel[]>(this.apiConfig.getUrl('/paiements-enfants/mensualites'), { params });
  }

  getInscriptions(status: SuiviStatusFilter = 'ALL'): Observable<InscriptionSuivi[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<InscriptionSuivi[]>(this.apiConfig.getUrl('/paiements-enfants/inscriptions'), { params });
  }

  getHistoriqueMensualites(enfantId: number): Observable<PaiementEnfant[]> {
    return this.http.get<PaiementEnfant[]>(this.apiConfig.getUrl(`/paiements-enfants/enfant/${enfantId}/mensualites`));
  }

  getHistoriqueInscription(enfantId: number): Observable<PaiementEnfant[]> {
    return this.http.get<PaiementEnfant[]>(this.apiConfig.getUrl(`/paiements-enfants/enfant/${enfantId}/inscription`));
  }
}