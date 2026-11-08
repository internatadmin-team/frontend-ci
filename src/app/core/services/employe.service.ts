import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Employe, CreateEmployeRequest, UpdateEmployeRequest, EmployeStats } from '../models/employe.model';
import { EmployeStatus, PrintActionResponse } from '../models/common.model';

@Injectable({ providedIn: 'root' })
export class EmployeService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(status?: EmployeStatus): Observable<Employe[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Employe[]>(this.apiConfig.getUrl('/employes'), { params });
  }

  getById(id: number): Observable<Employe> {
    return this.http.get<Employe>(this.apiConfig.getUrl(`/employes/${id}`));
  }

  getByMatricule(matricule: string): Observable<Employe> {
    return this.http.get<Employe>(this.apiConfig.getUrl(`/employes/matricule/${matricule}`));
  }

  search(query: string): Observable<Employe[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Employe[]>(this.apiConfig.getUrl('/employes/search'), { params });
  }

  create(data: CreateEmployeRequest, confirmDuplicate = false): Observable<Employe> {
    const params = new HttpParams().set('confirmDuplicate', confirmDuplicate);
    return this.http.post<Employe>(this.apiConfig.getUrl('/employes'), data, { params });
  }

  update(id: number, data: UpdateEmployeRequest): Observable<Employe> {
    return this.http.put<Employe>(this.apiConfig.getUrl(`/employes/${id}`), data);
  }

  updateStatus(id: number, status: EmployeStatus): Observable<Employe> {
    return this.http.patch<Employe>(this.apiConfig.getUrl(`/employes/${id}/status`), { status });
  }

  printCertificate(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/employes/${id}/print-certificate`), {});
  }

  printCard(id: number): Observable<PrintActionResponse> {
    return this.http.post<PrintActionResponse>(this.apiConfig.getUrl(`/employes/${id}/print-card`), {});
  }

  getStats(): Observable<EmployeStats> {
    return this.http.get<EmployeStats>(this.apiConfig.getUrl('/employes/stats'));
  }
}