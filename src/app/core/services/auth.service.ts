import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
  LoginRequest,
  LoginResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  RecoveryResetRequest,
  RecoveryResetResponse,
  User
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.apiConfig.getUrl('/auth/login'), 
      credentials
    ).pipe(
      tap(response => {
        this.storeAuthData(response);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(
      this.apiConfig.getUrl('/users/me/password'), 
      data
    ).pipe(
      tap(response => {
        // Si le backend retourne un nouveau token, le stocker
        if ((response as any).token) {
          this.updateToken((response as any).token);
        }
      })
    );
  }

  resetWithRecoveryCode(data: RecoveryResetRequest): Observable<RecoveryResetResponse> {
    return this.http.post<RecoveryResetResponse>(
      this.apiConfig.getUrl('/auth/reset-with-recovery-code'), 
      data
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /** Met à jour le token sans changer l'utilisateur (après changement de mot de passe) */
  updateToken(newToken: string): void {
    localStorage.setItem('token', newToken);
    // Mettre à jour l'utilisateur avec les nouvelles infos du token
    const user = this.extractUserFromToken(newToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /** Force le rechargement de l'app après changement de mot de passe */
  reloadApp(): void {
    window.location.href = '/login';
  }

  private storeAuthData(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    const user: User = {
      id: this.extractUserIdFromToken(response.token),
      username: response.username,
      fullName: response.fullName,
      role: response.role
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  private extractUserIdFromToken(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || 0;
    } catch {
      return 0;
    }
  }

  private extractUserFromToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || 0,
        username: payload.sub || '',
        fullName: payload.fullName || '',
        role: payload.role || 'GESTIONNAIRE'
      };
    } catch {
      return null;
    }
  }
}