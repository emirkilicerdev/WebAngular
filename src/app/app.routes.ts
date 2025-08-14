// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './components/home/home';
import { AuthGuard } from './guards/auth-guard';
import { UserListComponent } from './components/user-list/user-list';
import { UserDetailComponent } from './components/user-detail/user-detail'; // Yeni
import { UserFormComponent } from './components/user-form/user-form';     // Yeni
import { ProfileComponent } from './components/profile/profile'; // Yeni
import { ProfileEditComponent } from './components/profile-edit/profile-edit'; // Yeni
import { RoleGuard } from './guards/role-guard'; // Yeni
import { RoleSelectorComponent } from './components/role-selector/role-selector';
import { RoleManagementComponent } from './components/role-management/role-management'; // Yeni
import { NoAuthGuard } from './guards/no-auth-guard';
import { LeaveListComponent } from './components/leave-list/leave-list'; // Yeni
import { LeaveDetailComponent } from './components/leave-detail/leave-detail'; // Yeni
import { LeaveRequestComponent } from './components/leave-request/leave-request'; // Yeni

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard], // Home ve altındaki tüm rotalar için AuthGuard'ı kullan
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' }, // Home'a gidildiğinde varsayılan olarak kullanıcı listesine yönlendir
      {
        path: 'users',
        component: UserListComponent,
      },
      {
        path: 'users/new',
        component: UserFormComponent,
        canActivate: [RoleGuard],
        data: { role: 'Admin' }
      },
      {
        path: 'users/edit/:id',
        component: UserFormComponent,
        canActivate: [RoleGuard],
        data: { role: 'Admin' }
      },
      {
        path: 'users/:id',
        component: UserDetailComponent,
        canActivate: [RoleGuard],
        data: { role: 'Admin' }
      },
      {
        path: 'profile', // Profil rotası artık sadece /home altında
        component: ProfileComponent
        // canActivate: [AuthGuard] // AuthGuard zaten parent 'home' rotasında olduğu için burada tekrar etmeye gerek yok
      },
      {
        path: 'profile/edit', // Profil düzenleme rotası da /home altında
        component: ProfileEditComponent
        // canActivate: [AuthGuard] // AuthGuard zaten parent 'home' rotasında olduğu için burada tekrar etmeye gerek yok
      },
      {
        path: "roles",
        component: RoleManagementComponent,
      },
      {
        path: 'select-role', 
        component: RoleSelectorComponent, 
        canActivate: [AuthGuard] 
      },
      {
        path: 'leaves',
        component: LeaveListComponent,
        canActivate: [AuthGuard] // Sadece giriş yapmış kullanıcılar görebilmeli
      },
      {
        path: 'leaves/new',
        component: LeaveRequestComponent,
        canActivate: [AuthGuard] // Sadece giriş yapmış kullanıcılar izin talebi oluşturabilmeli
      },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Uygulama ilk açıldığında login sayfasına yönlendir
  { path: '**', redirectTo: '/login' } // Tanımsız rotalar için login sayfasına yönlendir
];
