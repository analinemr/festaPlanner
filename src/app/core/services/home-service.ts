/**
 * SERVICE: LoginService
 *
 * Service focado especificamente no fluxo de login/logout,
 * separado das responsabilidades de guarda de token do AuthService.
 *
 * Por que ter os dois (AuthService + LoginService)?
 *
 *   AuthService  → responsável por: guardar/ler o token JWT no localStorage,
 *                  verificar se o usuário está autenticado, retornar dados do usuário logado,
 *                  limpar a sessão no logout.
 *                  Usado pelos Guards (auth-guards.ts, home.guard.ts) e pelo AdminComponent.
 *
 *   LoginService → responsável por: fazer a requisição POST /api/auth/login,
 *                  tratar os diferentes tipos de erro (401, 403, 0),
 *                  e delegar o armazenamento do token ao AuthService.
 *                  Usado exclusivamente pelo LoginComponent.
 *
 * Vantagem: se o endpoint de login mudar (ex: OAuth2, SSO), só o LoginService muda.
 * O AuthService, que é usado em muitos lugares, permanece intacto.
 *
 * Endpoint Spring Boot:
 *   POST /api/auth/login
 *   Body:    { "email": "admin@...", "senha": "..." }
 *   Success: { "token": "eyJ...", "admin": { "id": 1, "nome": "..." } }
 *   Error:   HTTP 401 Unauthorized
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth-service';
import { Login, AuthResponse } from '../../models/login';

/** Erros de login tratados para o template — mensagens prontas para exibição */
export interface ErroLogin {
  codigo:   number;    // Código HTTP: 401, 403, 0...
  mensagem: string;    // Mensagem em português para o usuário
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    private authService: AuthService  // Delega armazenamento do token ao AuthService
  ) {}

  /**
   * Realiza o login enviando credenciais ao Spring Boot.
   *
   * Fluxo completo:
   * 1. POST /api/auth/login com email + senha
   * 2. Spring Boot valida com BCrypt e retorna JWT
   * 3. tap() → AuthService salva o token no localStorage
   * 4. catchError() → transforma erros HTTP em mensagens amigáveis
   *
   * @param credenciais — objeto com email e senha do formulário
   * @returns Observable<AuthResponse> — token + dados do admin
   */
  entrar(credenciais: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.loginUrl, credenciais).pipe(

      /**
       * tap() → executado quando a resposta é bem-sucedida (não modifica o fluxo).
       * Delega ao AuthService salvar o token e os dados do usuário.
       */
      tap((resposta: AuthResponse) => {
        this.authService.salvarSessao(resposta.token, {
          nome: resposta.nome,
          email: resposta.email,
          perfil: resposta.perfil
        });
      }),

      /**
       * catchError() → captura erros HTTP e retorna mensagens amigáveis.
       * throwError() recria o Observable de erro para o subscriber tratar.
       */
      catchError((erro: HttpErrorResponse) => {
        const erroTratado: ErroLogin = this.traduzirErro(erro);
        return throwError(() => erroTratado);
      })
    );
  }

  /**
   * Traduz erros HTTP do Spring Boot em mensagens legíveis para o usuário.
   *
   * @param erro — objeto HttpErrorResponse do Angular
   * @returns ErroLogin com código e mensagem em português
   */
  private traduzirErro(erro: HttpErrorResponse): ErroLogin {
    if (erro.status === 401) {
      return { codigo: 401, mensagem: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
    }
    if (erro.status === 403) {
      return { codigo: 403, mensagem: 'Acesso negado. Sua conta não tem permissão de administrador.' };
    }
    if (erro.status === 0) {
      return { codigo: 0, mensagem: 'Servidor indisponível. Verifique sua conexão e tente novamente.' };
    }
    if (erro.status >= 500) {
      return { codigo: erro.status, mensagem: 'Erro interno do servidor. Tente novamente em instantes.' };
    }

    /* Tenta usar a mensagem retornada pelo Spring Boot, senão usa mensagem genérica */
    const mensagemBackend = erro.error?.message || erro.error?.erro;
    return {
      codigo:   erro.status,
      mensagem: mensagemBackend || 'Erro inesperado ao fazer login. Tente novamente.'
    };
  }

  /**
   * Atalho para logout — delega ao AuthService.
   * Centraliza a chamada para que o LoginComponent não precise injetar o AuthService.
   */
  sair(): void {
    this.authService.logout();
  }

  /** Verifica se há uma sessão ativa — delega ao AuthService */
  estaLogado(): boolean {
    return this.authService.estaAutenticado();
  }
}
