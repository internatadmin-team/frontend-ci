import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { GlobalDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  get(): Observable<GlobalDashboard> {
    return this.http.get<GlobalDashboard>(this.apiConfig.getUrl('/dashboard'));
  }
}