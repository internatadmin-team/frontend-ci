import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Tresorerie } from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class TresorerieService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  get(year?: number, month?: number): Observable<Tresorerie> {
    let params = new HttpParams();
    if (year != null) params = params.set('year', year);
    if (month != null) params = params.set('month', month);
    return this.http.get<Tresorerie>(this.apiConfig.getUrl('/tresorerie'), { params });
  }
}