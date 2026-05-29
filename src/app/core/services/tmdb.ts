import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie } from '../models/movie'; // Verifica que la ruta a tu modelo sea correcta

interface TmdbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);
  
  // Configuración base de la API de TMDb
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  private readonly apiKey = 'c3ac920a4c915cb4a994ef41d92ade33'; // Tu Token real de TMDb
  private readonly lang = 'es-MX';

  /**
   * RECUPERADO: Obtiene el catálogo de películas populares paginado para el Home
   */
  getPopularMovies(page: number = 1): Observable<Movie[]> {
    return this.http.get<TmdbResponse>(
      `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${this.lang}&page=${page}`
    ).pipe(
      map(response => response.results)
    );
  }

  /**
   * RECUPERADO: Filtra las películas por un término de búsqueda para la vista de Search
   */
  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    return this.http.get<TmdbResponse>(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=${this.lang}&query=${encodeURIComponent(query)}&page=${page}`
    ).pipe(
      map(response => response.results)
    );
  }

  /**
   * MANTIENE: Solicita la información extendida usando el ID de la película
   */
  getMovieDetails(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=${this.lang}`
    );
  }

  /**
   * MANTIENE: Obtiene los créditos de la película (Reparto de actores)
   */
  getMovieCredits(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}&language=${this.lang}`
    );
  }

  /**
   * MANTIENE: Obtiene las palabras clave (Keywords) vinculadas
   */
  getMovieKeywords(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/keywords?api_key=${this.apiKey}`
    );
  }

  /**
   * MANTIENE: Obtiene las clasificaciones por edad y fechas internacionales (Certificaciones)
   */
  getMovieReleaseDates(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/release_dates?api_key=${this.apiKey}`
    );
  }

  /**
   * MANTIENE: Obtiene los videos oficiales asociados a una película (Tráilers)
   */
  getMovieVideos(movieId: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/movie/${movieId}/videos?api_key=${this.apiKey}`
    );
  }
}

// c3ac920a4c915cb4a994ef41d92ade33