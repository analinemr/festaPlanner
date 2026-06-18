/**
 * ROTAS DA APLICAÇÃO: app.routes.ts
 *
 * Define todas as rotas de navegação do Festa Planner.
 * Usa Lazy Loading para carregar componentes sob demanda,
 * melhorando a performance inicial da aplicação.
 *
 * Rotas públicas: acessíveis sem autenticação
 * Rotas protegidas: requerem token JWT (AuthGuard)
 */
/**
 * ROTAS DA APLICAÇÃO (Angular 21)
 * Lazy Loading em todas as rotas para melhor performance.
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guards';
import { homeGuard } from './core/guards/home.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-component/home-component').then(m => m.HomeComponent)
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/catalogo/catalogo-component').then(m => m.CatalogoComponent)
  },
  {
    path: 'orcamento',
    loadComponent: () =>
      import('./pages/orcamento-component/orcamento-component').then(m => m.OrcamentoComponent)
  },
  {
    path: 'login',
    canActivate: [homeGuard],
    loadComponent: () =>
      import('./pages/login-component/login-component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin-component/admin-component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/pedidos-component/pedido-component').then(m => m.PedidosComponent)
  },
  {
    path: 'admin/agenda',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/agendas/agenda-component').then(m => m.AgendaComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
