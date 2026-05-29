import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router'; // <-- Asegúrate de importar withComponentInputBinding
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()), // <-- CRUCIAL: Esto mapea los parámetros de la URL de forma automática y segura
    provideHttpClient()
  ]
};