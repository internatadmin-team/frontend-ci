import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Enfant, CreateEnfantRequest, UpdateEnfantRequest, EnfantStats } from '../models/enfant.model';
import { EnfantStatus, PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class EnfantService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(status?: EnfantStatus): Observable<Enfant[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Enfant[]>(this.apiConfig.getUrl('/enfants'), { params });
  }

  getById(id: number): Observable<Enfant> {
    return this.http.get<Enfant>(this.apiConfig.getUrl(`/enfants/${id}`));
  }

  getByMatricule(matricule: string): Observable<Enfant> {
    return this.http.get<Enfant>(this.apiConfig.getUrl(`/enfants/matricule/${matricule}`));
  }

  search(query: string): Observable<Enfant[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Enfant[]>(this.apiConfig.getUrl('/enfants/search'), { params });
  }

  create(data: CreateEnfantRequest, confirmDuplicate = false): Observable<Enfant> {
    const params = new HttpParams().set('confirmDuplicate', confirmDuplicate);
    return this.http.post<Enfant>(this.apiConfig.getUrl('/enfants'), data, { params });
  }

  update(id: number, data: UpdateEnfantRequest): Observable<Enfant> {
    return this.http.put<Enfant>(this.apiConfig.getUrl(`/enfants/${id}`), data);
  }

  updateStatus(id: number, status: EnfantStatus): Observable<Enfant> {
    return this.http.patch<Enfant>(this.apiConfig.getUrl(`/enfants/${id}/status`), { status });
  }

  printCertificate(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/enfants/${id}/print-certificate`), {});
  }

  printCard(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/enfants/${id}/print-card`), {});
  }

  getStats(): Observable<EnfantStats> {
    return this.http.get<EnfantStats>(this.apiConfig.getUrl('/enfants/stats'));
  }
}