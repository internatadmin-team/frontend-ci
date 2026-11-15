import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const publicUrls = ['/api/auth/login', '/api/auth/reset-with-recovery-code'];
  const isPublic = publicUrls.some(url => req.url.includes(url));

  if (isPublic) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !router.url.startsWith('/login')) {
        authService.logout();
        router.navigate(['/login'], { replaceUrl: true });
      }
      return throwError(() => error);
    })
  );
};