/**
 * AUTH INTERCEPTOR — Interceptor de Autenticação JWT (Angular 17+ Functional)
 *
 * Este interceptor é executado automaticamente em TODAS as requisições HTTP
 * feitas pelo HttpClient. Sua função é adicionar o token JWT no cabeçalho
 * Authorization para que o Spring Boot possa autenticar o usuário.
 *
 * Fluxo de cada requisição:
 *   Angular Component → HttpClient → authInterceptor → Spring Boot
 *
 * O Spring Boot lê o header: Authorization: Bearer <token>
 * e valida via Spring Security + JwtFilter configurado no backend.
 *
 * Registrado em app.config.ts via: withInterceptors([authInterceptor])
 */
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

/**
 * authInterceptor — interceptor funcional (nova sintaxe Angular 17+).
 * Não precisa ser uma classe, é uma função pura.
 *
 * @param req  — requisição HTTP original
 * @param next — próximo handler na cadeia (envia a requisição)
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {

  /**
   * Recupera o token JWT do localStorage.
   * O token foi salvo pelo AuthService após o login bem-sucedido.
   * Chave: 'fp_token' (definida no auth-service.ts)
   */
  const token = localStorage.getItem('fp_token');

  /**
   * Se houver token, clona a requisição original adicionando
   * o header Authorization com o prefixo "Bearer ".
   *
   * IMPORTANTE: Requisições HTTP são imutáveis no Angular,
   * por isso precisamos clonar (clone()) para modificar.
   *
   * O Spring Boot espera o formato: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   */
  if (token) {
    const reqAutenticada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    /* Envia a requisição clonada (com o token) */
    return next(reqAutenticada);
  }

  /**
   * Sem token (usuário não logado) → envia a requisição original sem modificação.
   * Rotas públicas (/api/catalogo GET, /api/orcamentos POST) não precisam de token.
   * O Spring Boot retornará 401 para rotas protegidas sem token.
   */
  return next(req);
};
