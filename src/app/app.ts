import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Home } from './feactures/home/home';
import { Favorites } from './feactures/favorites/favorites';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterModule,
    Home,
    Favorites,
    Navbar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('The_Movie_Data_Base');
}