import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private routerSub?: Subscription;
  private expirationTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    // 1. Vérification événementielle : à chaque navigation
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.checkToken(event.url));

    // 2. Vérification unique au démarrage de l'application
    this.checkToken(this.router.url);

    // 3. Synchronisation multi-onglets : réagit uniquement si le
    //    token change dans un AUTRE onglet (aucun coût tant que
    //    rien ne se passe, contrairement à un interval())
    window.addEventListener('storage', this.onStorageChange);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.clearExpirationTimer();
    window.removeEventListener('storage', this.onStorageChange);
  }

  private onStorageChange = (event: StorageEvent): void => {
    if (event.key === 'token') {
      this.checkToken(this.router.url);
    }
  };

  private checkToken(currentUrl: string): void {
    const token = this.authService.getToken();

    if (!token) {
      this.clearExpirationTimer();
      if (!currentUrl.startsWith('/login')) {
        this.authService.logout();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      if (Date.now() >= exp) {
        this.clearExpirationTimer();
        this.authService.logout();
        if (!currentUrl.startsWith('/login')) {
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        return;
      }

      // 4. Un seul minuteur, programmé pile à l'heure d'expiration
      //    (remplace la vérification répétée toutes les 3 secondes)
      this.scheduleExpiration(exp);

      if (currentUrl === '/change-password' && !payload.mustChangePassword) {
        // NOTE T05 : '/dashboard' n'existe pas encore (arrive avec T06) ; redirection temporaire vers '/eleves'
        this.router.navigate(['/eleves'], { replaceUrl: true });
        return;
      }

      if (!currentUrl.startsWith('/change-password') && !currentUrl.startsWith('/login') && payload.mustChangePassword) {
        this.router.navigate(['/change-password'], { replaceUrl: true });
        return;
      }
    } catch {
      this.clearExpirationTimer();
      this.authService.logout();
      if (!currentUrl.startsWith('/login')) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }
  }

  private scheduleExpiration(expTimestampMs: number): void {
    this.clearExpirationTimer();
    const delay = Math.min(expTimestampMs - Date.now(), 2_147_483_647); // borne setTimeout (~24,8 jours max)

    this.expirationTimer = setTimeout(() => {
      this.authService.logout();
      if (!this.router.url.startsWith('/login')) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }, delay);
  }

  private clearExpirationTimer(): void {
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = undefined;
    }
  }
}