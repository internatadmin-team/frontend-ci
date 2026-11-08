import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { changePasswordGuard } from './core/guards/change-password.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

// NOTE T05 : les routes dashboard / paiements / finances / audit seront
// ajoutees par T06 (Arame) une fois ces ecrans livres. En attendant, la
// page par defaut est "eleves".
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'change-password',
    canActivate: [changePasswordGuard],
    loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'eleves', pathMatch: 'full' },
      {
        path: 'eleves',
        loadComponent: () => import('./features/eleves/eleves.component').then(m => m.ElevesComponent)
      },
      {
        path: 'employes',
        loadComponent: () => import('./features/employes/employes.component').then(m => m.EmployesComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'parametres',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/parametres/parametres.component').then(m => m.ParametresComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
