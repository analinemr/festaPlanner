/**
 * MAIN.TS — Ponto de Entrada (Angular 21)
 *
 * Referencia a classe "App" (não "AppComponent")
 * conforme gerado pelo CLI v19+.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error('Erro ao inicializar o FestaPlanner:', err));
