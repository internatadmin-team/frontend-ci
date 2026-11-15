import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { changePasswordGuard } from './core/guards/change-password.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'eleves',
        loadComponent: () => import('./features/eleves/eleves.component').then(m => m.ElevesComponent)
      },
      {
        path: 'employes',
        loadComponent: () => import('./features/employes/employes.component').then(m => m.EmployesComponent)
      },
      {
        path: 'paiements',
        loadComponent: () => import('./features/paiements/paiements.component').then(m => m.PaiementsComponent)
      },
      {
        path: 'finances',
        loadComponent: () => import('./features/finances/finances.component').then(m => m.FinancesComponent)
      },
     {
        path: 'audit',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/audit/audit.component').then(m => m.AuditComponent)
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