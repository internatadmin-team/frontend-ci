import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { AutreRecette, CreateAutreRecetteRequest } from '../models/finance.model';
import { PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class AutreRecetteService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(year?: number, month?: number): Observable<AutreRecette[]> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    return this.http.get<AutreRecette[]>(this.apiConfig.getUrl('/autres-recettes'), { params });
  }

  create(data: CreateAutreRecetteRequest, confirmDuplicate = false): Observable<AutreRecette> {
    return this.http.post<AutreRecette>(this.apiConfig.getUrl('/autres-recettes'), { ...data, confirmDuplicate });
  }

  cancel(id: number): Observable<AutreRecette> {
    return this.http.patch<AutreRecette>(this.apiConfig.getUrl(`/autres-recettes/${id}/cancel`), {});
  }

  printReceipt(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/autres-recettes/${id}/print-receipt`), {});
  }

  getReceiptData(id: number): Observable<AutreRecette> {
    return this.http.get<AutreRecette>(this.apiConfig.getUrl(`/autres-recettes/${id}/receipt-data`));
  }
}