import { Component, signal, inject, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // <-- INYECCIÓN DEL ENRUTADOR GLOBAL
import { TmdbService } from '../../core/services/tmdb';
import { FavoritesService } from '../favorites/favorites.service';
import { SearchService } from '../../core/services/search.service';
import { Movie } from '../../core/models/movie';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // Al usar navegación por función, ya no ocupamos RouterLink aquí
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  private tmdbService = inject(TmdbService);
  private favoritesService = inject(FavoritesService);
  private searchService = inject(SearchService);
  private router = inject(Router); // <-- Instanciamos el router

  movies = signal<Movie[]>([]);
  isLoading = signal<boolean>(true);
  currentPage = signal<number>(1);

  constructor() {
    /**
     * EFECTO CENTINELA DE BUSCADOR:
     * Escucha el Navbar. Corre una vez al arrancar (por eso el log inicial)
     * y luego solo si cambia el string de búsqueda.
     */
    effect(() => {
      const query = this.searchService.searchQuery();
      
      untracked(() => {
        this.currentPage.set(1); 
        if (!query || query.trim() === '') {
          this.getPopularCatalog(true); 
        } else {
          this.executeSearch(query, true);
        }
      });
    });
  }

  private getPopularCatalog(resetIfNewQuery: boolean = false) {
    this.isLoading.set(true);
    this.tmdbService.getPopularMovies(this.currentPage()).subscribe({
      next: (data: Movie[]) => {
        if (resetIfNewQuery) {
          this.movies.set(data);
        } else {
          this.movies.update(currentList => [...currentList, ...data]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar catálogo popular:', err);
        this.isLoading.set(false);
      }
    });
  }

  private executeSearch(query: string, resetIfNewQuery: boolean = false) {
    this.isLoading.set(true);
    this.tmdbService.searchMovies(query, this.currentPage()).subscribe({
      next: (results: Movie[]) => {
        if (resetIfNewQuery) {
          this.movies.set(results);
        } else {
          this.movies.update(currentList => [...currentList, ...results]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error en búsqueda de TMDb:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * FUNCIÓN DE NAVEGACIÓN MANUAL FORZADA:
   * Al hacer clic en la tarjeta, dispara el cambio de ruta en Brave de inmediato.
   */
  goToDetail(movieId: number) {
    console.log('[Home] Click detectado. Forzando navegación al ID:', movieId);
    this.router.navigate(['/movie', movieId]);
  }

  toggleFavorite(movie: Movie) {
    if (this.favoritesService.isFavorite(movie.id)) {
      this.favoritesService.removeFromFavorites(movie.id);
    } else {
      this.favoritesService.addToFavorites(movie);
    }
  }

  isMovieFavorite(movieId: number): boolean {
    return this.favoritesService.isFavorite(movieId);
  }

  loadMoreMovies() {
    this.currentPage.update(page => page + 1);
    const query = this.searchService.searchQuery();

    if (!query || query.trim() === '') {
      this.getPopularCatalog(false);
    } else {
      this.executeSearch(query, false);
    }
  }
}