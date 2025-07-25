// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './auth-interceptor';
import { provideMatSnackBar } from '@angular/material/snack-bar';
import { provideDialog } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([
      AuthInterceptor
    ])),
    provideMatSnackBar(), // MatSnackBar'ı global olarak sağlar
    provideDialog()       // MatDialog'ı global olarak sağlar
  ]
};