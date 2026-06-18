/**
 * APP CONFIG — Configuração Central (Angular 21)
 *
 * Angular 21 não usa mais Zone.js por padrão.
 * O changeDetection agora é baseado em Signals (zoneless).
 */

import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes, withComponentInputBinding()),

    /**
     * provideHttpClient — habilita o HttpClient para injeção nos services.
     * withInterceptors — registra o authInterceptor que adiciona o token JWT
     * em todas as requisições ao Spring Boot automaticamente.
     */
    provideHttpClient(
      withInterceptors([authInterceptor])
    )

  ]
};
