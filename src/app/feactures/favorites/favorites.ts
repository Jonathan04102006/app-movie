import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router'; // <-- Asegura estas dos importaciones
import { FavoritesService } from './favorites.service';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink], // <-- Agrega RouterModule aquí
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class Favorites {
  private favoritesService = inject(FavoritesService);
  private searchService = inject(SearchService);

  /**
   * SIGNAL COMPUTADA:
   * Filtra la lista de favoritos guardada en el disco local de forma inmediata
   * en cuanto el usuario escribe una letra en la barra de búsqueda superior.
   */
  favoriteMovies = computed(() => {
    const allFavorites = this.favoritesService.favorites();
    const query = this.searchService.searchQuery().toLowerCase().trim();

    if (query === '') {
      return allFavorites;
    }

    return allFavorites.filter(movie => 
      movie.title.toLowerCase().includes(query)
    );
  });

  removeFromFavorites(movieId: number) {
    this.favoritesService.removeFromFavorites(movieId);
  }
}