import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TmdbService } from '../../core/services/tmdb';

interface Genre {
  id: number;
  name: string;
}

interface MovieDetailData {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: Genre[];
  production_countries?: any[];
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Keyword {
  id: number;
  name: string;
}

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-detail.html',
  styleUrls: ['./movie-detail.css']
})
export class MovieDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private tmdbService = inject(TmdbService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  public movie = signal<MovieDetailData | null>(null);
  public cast = signal<Cast[]>([]);
  public keywords = signal<Keyword[]>([]);
  public director = signal<string>('Desconocido');
  public writers = signal<string>('Desconocido');
  public certification = signal<string>('');
  public isFavorite = signal<boolean>(false);

  // Controladores reactivos para el Modal del Tráiler
  public trailerUrl = signal<SafeResourceUrl | null>(null);
  public rawVideoKey = signal<string | null>(null);
  public isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const movieIdStr = params.get('id');
        if (movieIdStr) {
          const movieId = Number(movieIdStr);
          this.loadMovieData(movieId);
          this.checkIfFavorite(movieId);
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  private loadMovieData(movieId: number): void {
    this.tmdbService.getMovieDetails(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: MovieDetailData) => this.movie.set(data),
        error: (err: any) => console.error('Error cargando detalles:', err)
      });

    this.tmdbService.getMovieCredits(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res && res.cast) {
            this.cast.set(res.cast);
          }
          if (res && res.crew) {
            const dirObj = res.crew.find((member: any) => member.job === 'Director');
            if (dirObj) this.director.set(dirObj.name);

            const writerMembers = res.crew.filter((member: any) => member.job === 'Screenplay' || member.job === 'Writer');
            if (writerMembers.length > 0) {
              this.writers.set(writerMembers.map((m: any) => m.name).join(', '));
            }
          }
        },
        error: (err: any) => console.error('Error cargando créditos:', err)
      });

    this.tmdbService.getMovieKeywords(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res && res.keywords) {
            this.keywords.set(res.keywords.slice(0, 8));
          }
        },
        error: (err: any) => console.error('Error cargando palabras clave:', err)
      });

    this.tmdbService.getMovieReleaseDates(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res && res.results) {
            const usRelease = res.results.find((r: any) => r.iso_3166_1 === 'US');
            const certificationValue = usRelease?.release_dates?.[0]?.certification 
              || res.results[0]?.release_dates?.[0]?.certification;
            
            this.certification.set(certificationValue || 'N/A');
          }
        },
        error: (err: any) => console.error('Error cargando clasificación:', err)
      });

    // 🛠️ CONTROLADOR DE TRÁILER INTEGRADO CON PARÁMETROS ANTIBLOQUEO DE YT
    this.tmdbService.getMovieVideos(movieId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res && res.results && res.results.length > 0) {
            const officialTrailer = res.results.find(
              (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
            );
            
            const videoKey = officialTrailer?.key || res.results[0]?.key;
            if (videoKey) {
              this.rawVideoKey.set(videoKey);

              // Para evadir el error 153 en Dev Tunnels, forzamos a YouTube a heredar el origen seguro https directo de la ventana
              const currentOrigin = window.location.protocol + '//' + window.location.host;
              const embedUrl = `https://www.youtube.com/embed/${videoKey}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(currentOrigin)}&rel=0`;
              
              this.trailerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl));
            }
          } else {
            this.trailerUrl.set(null);
            this.rawVideoKey.set(null);
          }
        },
        error: (err: any) => console.error('Error cargando video de tráiler:', err)
      });
  }

  public goBack(): void {
    this.location.back();
  }

  public formatRuntime(minutes: number | undefined): string {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  public getGenresList(): string {
    const currentGenres = this.movie()?.genres;
    if (!currentGenres || currentGenres.length === 0) return 'Sin géneros';
    return currentGenres.map(genre => genre.name).join(', ');
  }

  public productionCountries(): string {
    const countries = this.movie()?.production_countries;
    if (!countries || countries.length === 0) return 'No disponible';
    return countries.map((c: any) => c.name).join(', ');
  }

  private checkIfFavorite(movieId: number): void {
    const currentFavs = JSON.parse(localStorage.getItem('favorites_movies') || '[]');
    const exists = currentFavs.some((fav: any) => fav.id === movieId);
    this.isFavorite.set(exists);
  }

  public toggleFavorite(): void {
    const currentMovie = this.movie();
    if (!currentMovie) return;

    let currentFavs = JSON.parse(localStorage.getItem('favorites_movies') || '[]');
    
    if (this.isFavorite()) {
      currentFavs = currentFavs.filter((fav: any) => fav.id !== currentMovie.id);
      this.isFavorite.set(false);
    } else {
      currentFavs.push({
        id: currentMovie.id,
        title: currentMovie.title,
        poster_path: currentMovie.poster_path,
        vote_average: currentMovie.vote_average,
        release_date: currentMovie.release_date
      });
      this.isFavorite.set(true);
    }
    
    localStorage.setItem('favorites_movies', JSON.stringify(currentFavs));
  }

  public slideMovies(element: HTMLDivElement, direction: 'left' | 'right'): void {
    const scrollAmount = 480; 
    if (direction === 'left') {
      element.scrollLeft -= scrollAmount;
    } else {
      element.scrollLeft += scrollAmount;
    }
  }

  public openModal(): void {
    if (this.trailerUrl()) {
      this.isModalOpen.set(true);
    }
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
  }

  public openTrailerExternal(): void {
    const key = this.rawVideoKey();
    if (key) {
      window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
    }
  }
}