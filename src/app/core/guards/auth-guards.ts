/**
 * GUARD: Proteção de Rotas Autenticadas
 *
 * Impede que usuários não autenticados acessem rotas protegidas.
 * Usado em app.routes.ts para proteger as rotas do administrador.
 *
 * Como funciona:
 * 1. Angular chama canActivate() antes de carregar o componente
 * 2. Se o usuário tem token JWT → permite acesso
 * 3. Se não tem token → redireciona para /login
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/** Protege rotas admin — redireciona para /login se não autenticado */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('fp_token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
