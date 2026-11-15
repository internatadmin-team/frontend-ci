import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    
    if (Date.now() >= exp) {
      authService.logout();
      router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    if (payload.mustChangePassword) {
      // Éviter la navigation si on est déjà sur change-password
      if (!router.url.includes('/change-password')) {
        router.navigate(['/change-password'], { replaceUrl: true });
      }
      return false;
    }

    return true;
  } catch {
    authService.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};