/**
 * GUARD: Redirecionamento de Usuário Já Autenticado
 *
 * Impede que um administrador já logado acesse a tela de login novamente.
 * Se o admin já está autenticado e tenta ir para /login,
 * é redirecionado para o painel /admin.
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/** Redireciona admin já logado de /login para /admin */
export const homeGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('fp_token');
  if (token) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
