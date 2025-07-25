// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './components/home/home';
import { authGuard } from './guards/auth-guard';
import { UserListComponent } from './components/user-list/user-list';
import { UserDetailComponent } from './components/user-detail/user-detail'; // Yeni
import { UserFormComponent } from './components/user-form/user-form';     // Yeni

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard], // Ana sayfa korumalı
    children: [
      { path: 'users', component: UserListComponent }, // Kullanıcı listesi için alt route
      { path: 'users/new', component: UserFormComponent }, // Yeni kullanıcı ekleme
      { path: 'users/edit/:id', component: UserFormComponent }, // Kullanıcı düzenleme (ID ile)
      { path: 'users/:id', component: UserDetailComponent } // Kullanıcı detayı (ID ile)
    ]
  },
  // Korumalı olmayan başka sayfalar varsa buraya ekleyin
  { path: '**', redirectTo: '/home' } // Tanımsız yollar için yönlendirme
];