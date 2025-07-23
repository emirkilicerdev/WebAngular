// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // RouterOutlet'i import et

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet // RouterOutlet'i buraya ekliyoruz
  ],
  template: `
    <main>
      <router-outlet></router-outlet> </main>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WebAngular';
}