import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const changePasswordGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // PAS DE TOKEN = redirection login
  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Token expiré ?
    const exp = payload.exp * 1000;
    if (Date.now() >= exp) {
      authService.logout();
      router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    // Doit changer le MDP ? Oui = accès autorisé
    if (payload.mustChangePassword) {
      return true;
    }

    // Déjà changé, aller au dashboard (éviter boucle)
    if (!router.url.includes('/dashboard')) {
      router.navigate(['/dashboard'], { replaceUrl: true });
    }
    return false;
    
  } catch {
    authService.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
};