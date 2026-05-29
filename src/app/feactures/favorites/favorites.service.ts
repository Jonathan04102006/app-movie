import { Injectable, signal, effect } from '@angular/core';
import { Movie } from '../../core/models/movie'; // Verifica que la ruta a tu modelo sea correcta

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  
  // La Signal privada arranca intentando leer lo que haya guardado en el disco local.
  // Si no encuentra nada, inicializa el arreglo vacío [] por defecto.
  private favoritesList = signal<Movie[]>(this.loadFromLocalStorage());

  get favorites() {
    return this.favoritesList.asReadonly();
  }

  constructor() {
    /**
     * EFECTO REACTIVO (effect): Esta es una característica avanzada de Angular.
     * Cada vez que la Signal 'favoritesList' cambie (ya sea porque agregas o quitas una película),
     * este bloque se ejecutará automáticamente para sincronizar y escribir los datos en el LocalStorage.
     */
    effect(() => {
      localStorage.setItem('movie_db_favorites', JSON.stringify(this.favoritesList()));
    });
  }

  /**
   * Método privado para leer los datos del LocalStorage al encender la app.
   */
  private loadFromLocalStorage(): Movie[] {
    const savedFavorites = localStorage.getItem('movie_db_favorites');
    if (savedFavorites) {
      try {
        // Convertimos el string de texto plano nuevamente en un arreglo de objetos JavaScript/TypeScript
        return JSON.parse(savedFavorites);
      } catch (error) {
        console.error('Error al parsear los favoritos del LocalStorage:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Añade una película a la lista global y dispara automáticamente el guardado en disco.
   */
  addToFavorites(movie: Movie) {
    const alreadyExists = this.favoritesList().some(f => f.id === movie.id);
    
    if (!alreadyExists) {
      this.favoritesList.update(current => [...current, movie]);
      console.log(`[Persistencia] Guardada con éxito en disco: ${movie.title}`);
    }
  }

  /**
   * Remueve una película de la lista global y actualiza el disco automáticamente.
   */
  removeFromFavorites(movieId: number) {
    this.favoritesList.update(current => current.filter(m => m.id !== movieId));
    console.log(`[Persistencia] Eliminada de disco ID: ${movieId}`);
  }

  /**
   * Verifica de manera reactiva si la película ya es favorita para mantener el corazón encendido.
   */
  isFavorite(movieId: number): boolean {
    return this.favoritesList().some(m => m.id === movieId);
  }
}