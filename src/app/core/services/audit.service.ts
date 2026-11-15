import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { PageAuditLog, AuditFilter } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  getHistory(filter: AuditFilter = {}): Observable<PageAuditLog> {
    let params = this.buildPageableParams(filter.page, filter.size);
    if (filter.entityType) params = params.set('entityType', filter.entityType);
    if (filter.entityId != null) params = params.set('entityId', filter.entityId);
    if (filter.userId != null) params = params.set('userId', filter.userId);
    return this.http.get<PageAuditLog>(this.apiConfig.getUrl('/audit'), { params });
  }

  getMyRecentActivity(page = 0, size = 20): Observable<PageAuditLog> {
    const params = this.buildPageableParams(page, size);
    return this.http.get<PageAuditLog>(this.apiConfig.getUrl('/audit/me'), { params });
  }

  private buildPageableParams(page = 0, size = 20): HttpParams {
    return new HttpParams().set('page', page).set('size', size);
  }
}