import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root' // <-- Garantiza una única instancia global en memoria RAM para toda la app
})
export class SearchService {
  
  /**
   * Signal reactiva privada que almacena el término de búsqueda actual.
   * Se inicializa con un string vacío para cargar el catálogo por defecto.
   */
  private searchQuerySignal = signal<string>('');

  /**
   * GETTER READ-ONLY: Expone la Signal de forma segura como solo lectura.
   * Esto permite que componentes como el 'Home' vigilen los cambios de texto,
   * pero evita que alteren el estado de forma ilegal fuera de este servicio.
   */
  get searchQuery() {
    return this.searchQuerySignal.asReadonly();
  }

  /**
   * ACTUALIZADOR DE ESTADO: Método centralizado que invoca el Navbar
   * en cada evento (input) para mutar el valor de la consulta en tiempo real.
   * @param query Texto ingresado por el usuario en la barra de búsqueda
   */
  updateSearchQuery(query: string) {
    this.searchQuerySignal.set(query);
  }
}