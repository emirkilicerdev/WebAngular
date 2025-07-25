// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../user-list/user-list'; // UserListComponent'i import et

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent // Component'i imports dizisine ekle
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  constructor() { }
}