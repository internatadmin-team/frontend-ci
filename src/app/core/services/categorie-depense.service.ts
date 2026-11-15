import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { CategorieDepense, CreateCategorieDepenseRequest, CategorieDepenseFilter } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class CategorieDepenseService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(status: CategorieDepenseFilter = 'ACTIVE'): Observable<CategorieDepense[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<CategorieDepense[]>(this.apiConfig.getUrl('/categories-depenses'), { params });
  }

  create(data: CreateCategorieDepenseRequest): Observable<CategorieDepense> {
    return this.http.post<CategorieDepense>(this.apiConfig.getUrl('/categories-depenses'), data);
  }

  deactivate(id: number): Observable<CategorieDepense> {
    return this.http.patch<CategorieDepense>(this.apiConfig.getUrl(`/categories-depenses/${id}/deactivate`), {});
  }
}