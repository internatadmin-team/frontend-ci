import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
      router.navigate(['/dashboard'], { replaceUrl: true });
      return false;
    }
    return true;
  };
}