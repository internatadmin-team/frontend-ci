import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
  UserSummary,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UserStats,
} from '../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  list(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.apiConfig.getUrl('/users'));
  }

  create(data: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.apiConfig.getUrl('/users'), data);
  }

  update(id: number, data: UpdateUserRequest): Observable<UserSummary> {
    return this.http.put<UserSummary>(this.apiConfig.getUrl(`/users/${id}`), data);
  }

  resetPassword(id: number): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(this.apiConfig.getUrl(`/users/${id}/reset-password`), {});
  }

  deactivate(id: number): Observable<UserSummary> {
    return this.http.post<UserSummary>(this.apiConfig.getUrl(`/users/${id}/deactivate`), {});
  }

  activate(id: number): Observable<UserSummary> {
    return this.http.post<UserSummary>(this.apiConfig.getUrl(`/users/${id}/activate`), {});
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(this.apiConfig.getUrl('/users/stats'));
  }
}