import { Injectable, signal, effect } from '@angular/core';
import { Movie } from '../models/movie';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storageKey = 'movie_app_favorites';

  // Signal que lee el estado inicial de localStorage
  favorites = signal<Movie[]>(this.loadFromStorage());

  constructor() {
    // Cada vez que cambie el Signal de favoritos, se guarda automáticamente
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites()));
    });
  }

  private loadFromStorage(): Movie[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addFavorite(movie: Movie): void {
    if (!this.isFavorite(movie.id)) {
      this.favorites.update(current => [...current, movie]);
    }
  }

  removeFavorite(id: number): void {
    this.favorites.update(current => current.filter(m => m.id !== id));
  }

  isFavorite(id: number): boolean {
    return this.favorites().some(m => m.id === id);
  }
}