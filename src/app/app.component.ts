/**
 * APP COMPONENT — Componente Raiz da Aplicação
 *
 * Este é o ponto de entrada dos componentes Angular.
 * Como a aplicação usa roteamento, o template contém apenas
 * o <router-outlet> que renderiza o componente da rota ativa.
 *
 * Em aplicações standalone (Angular 17+), este componente
 * substitui o AppModule tradicional para a declaração de imports globais.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',          // Tag usada no index.html: <app-root></app-root>
  standalone: true,
  imports: [
    RouterOutlet                 // Necessário para o <router-outlet> funcionar no template
  ],
  template: `
    <!--
      router-outlet → "slot" onde o Angular injeta o componente
      correspondente à rota atual (home, login, admin, etc.)
      Definidas em app.routes.ts
    -->
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'festaplanner';
}
