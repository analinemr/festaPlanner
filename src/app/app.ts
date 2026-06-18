/**
 * APP — Componente Raiz da Aplicação (Angular 21)
 *
 * No Angular 21 o CLI gera a classe como "App" (não "AppComponent")
 * e os arquivos sem o sufixo ".component".
 *
 * O template contém apenas o <router-outlet> que renderiza
 * o componente da rota ativa (home, login, admin, etc.)
 * conforme definido em app.routes.ts
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'festaPlanner';
}
