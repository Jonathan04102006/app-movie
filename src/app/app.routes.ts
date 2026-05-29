import { Routes } from '@angular/router';
import { Home } from './feactures/home/home';
import { Favorites } from './feactures/favorites/favorites';
import { Search } from './feactures/search/search';
import { MovieCard } from './shared/components/movie-card/movie-card';
import { Navbar } from './shared/components/navbar/navbar';
// 1. Asegúrate de importar el componente físico que creaste
import { MovieDetail } from './feactures/movie-detail/movie-detail'; 

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'favorites',
    component: Favorites
  },
  {
    path: 'search',
    component: Search
  },
  {
    path: 'movie-card',
    component: MovieCard
  },
  {
    path: 'navbar',
    component: Navbar
  },
  
  // 2. DESCOMENTA Y DEJA ACTIVA ESTA RUTA DINÁMICA:
  {
    path: 'movie/:id',
    component: MovieDetail
  }
];