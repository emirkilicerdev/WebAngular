// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component'; 
import { LoginComponent } from './auth/login/login.component';     

export const routes: Routes = [
  { path: 'register', component: RegisterComponent }, // /register yolu için RegisterComponent'i kullan
  { path: 'login', component: LoginComponent },       // /login yolu için LoginComponent'i kullan
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Varsayılan yolu /login'e yönlendir
  { path: '**', redirectTo: '/login' } // Tanımsız yollar için /login'e yönlendir (404 benzeri)
];