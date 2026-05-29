import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// CORRECCIÓN DE RUTA: Tres niveles hacia atrás para salir de shared/components/navbar
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  private searchService = inject(SearchService);
  private router = inject(Router);

  /**
   * ACTUALIZA LA BÚSQUEDA EN TIEMPO REAL:
   * Emite el valor del input hacia la Signal global del SearchService.
   */
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.updateSearchQuery(input.value);
  }

  /**
   * REINICIAR APLICACIÓN DE RAÍZ:
   * Vacía el estado reactivo, limpia el campo visual en el DOM y fuerza
   * el retorno al Home para refrescar el catálogo popular.
   */
  resetApp() {
    console.log('[Navbar] Click en logo detectado. Reseteando aplicación...');

    // 1. Apagamos la query reactiva regresándola a un string vacío
    this.searchService.updateSearchQuery('');

    // 2. Limpiamos manualmente el valor estático escrito dentro del input del DOM
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    // 3. Forzamos la redirección al Home. Si el usuario ya estaba en el Home, 
    //    el effect() del Home capturará la query vacía y recargará la página 1 automáticamente.
    this.router.navigate(['/']);
  }
}