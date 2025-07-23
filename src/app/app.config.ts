// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes'; // Projenizin routing dosyası

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Routing için
    provideHttpClient(),
    provideAnimations()     
  ]
};