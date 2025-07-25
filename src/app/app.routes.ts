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
    component: HomeComponent, // HomeComponent buraya yüklenecek
    canActivate: [authGuard],
    children: [
      // /home adresine gidildiğinde varsayılan olarak /home/users adresine yönlendir.
      // Bu sayede HomeComponent yüklendiğinde UserListComponent otomatik olarak görünür.
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UserListComponent },
      { path: 'users/new', component: UserFormComponent },
      { path: 'users/edit/:id', component: UserFormComponent },
      { path: 'users/:id', component: UserDetailComponent }
    ]
  },
  { path: '**', redirectTo: '/home' }
];
