export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface TmdbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string; // <-- AGREGA ESTA LÍNEA AQUÍ
  release_date: string;
  vote_average: number;
  overview: string;
}