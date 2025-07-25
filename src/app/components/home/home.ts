// src/app/components/home/home.component.ts (veya home.ts)
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // <<< RouterOutlet KALMALI, çünkü home.html'de kullanılıyor
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // HomeComponent'in çocuk rotalarını yüklemek için
    MatCardModule // home.html'de MatCard kullanıldığı için
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  constructor() { }
}
