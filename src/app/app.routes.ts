// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth-guard';
import { RoleGuard } from './guards/role-guard';

export const routes: Routes = [
  // Auth
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent), 
    canActivate: [NoAuthGuard] 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/register/register.component').then(c => c.RegisterComponent), 
    canActivate: [NoAuthGuard] 
  },

  // Home ve child route'lar
  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then(c => c.HomeComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },

      // Users
      { 
        path: 'users', 
        loadComponent: () => import('./components/user-list/user-list').then(c => c.UserListComponent) 
      },
      { 
        path: 'users/new', 
        loadComponent: () => import('./components/user-form/user-form').then(c => c.UserFormComponent), 
        canActivate: [RoleGuard], 
        data: { role: 'Admin' } 
      },
      { 
        path: 'users/edit/:id', 
        loadComponent: () => import('./components/user-form/user-form').then(c => c.UserFormComponent), 
        canActivate: [RoleGuard], 
        data: { role: 'Admin' } 
      },
      { 
        path: 'users/:id', 
        loadComponent: () => import('./components/user-detail/user-detail').then(c => c.UserDetailComponent), 
        canActivate: [RoleGuard], 
        data: { role: 'Admin' } 
      },

      // Profile
      { 
        path: 'profile', 
        loadComponent: () => import('./components/profile/profile').then(c => c.ProfileComponent) 
      },
      { 
        path: 'profile/edit', 
        loadComponent: () => import('./components/profile-edit/profile-edit').then(c => c.ProfileEditComponent) 
      },

      // Roles
      { 
        path: 'roles', 
        loadComponent: () => import('./components/role-management/role-management').then(c => c.RoleManagementComponent) 
      },
      { 
        path: 'select-role', 
        loadComponent: () => import('./components/role-selector/role-selector').then(c => c.RoleSelectorComponent),
        canActivate: [AuthGuard] 
      },

      // Leaves
      { 
        path: 'leaves', 
        loadComponent: () => import('./components/leave-list/leave-list').then(c => c.LeaveListComponent) 
      },
      { 
        path: 'leaves/new', 
        loadComponent: () => import('./components/leave-request/leave-request').then(c => c.LeaveRequestComponent) 
      },
      { 
        path: 'leaves/:id', 
        loadComponent: () => import('./components/leave-detail/leave-detail').then(c => c.LeaveDetailComponent) 
      },
    ]
  },

  // Default & fallback
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
