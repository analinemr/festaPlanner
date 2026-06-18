/**
 * SERVIÇO: Autenticação
 *
 * Gerencia login, logout e armazenamento do token JWT
 * retornado pelo Spring Boot Security.
 *
 * Endpoints Spring Boot esperados:
 *   POST /api/auth/login   → { email, senha } → retorna { token, nome, ... }
 *   POST /api/auth/logout  → Invalida sessão no servidor
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Login, AuthResponse } from '../../models/login';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** URL base da autenticação no Spring Boot */
  private apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Chave usada para armazenar o token JWT no localStorage do navegador
   * O token é enviado em todas as requisições protegidas via HTTP Interceptor
   */
  private TOKEN_KEY = 'fp_token';

  /** Chave para armazenar dados básicos do usuário logado */
  private USER_KEY = 'fp_user';

  constructor(private http: HttpClient) {}

  /**
   * Realiza login no backend Spring Boot
   * Após sucesso, salva o token JWT e dados do usuário no localStorage
   * O operador `tap` executa o armazenamento sem alterar o fluxo Observable
   *
   * @param credenciais - { email, senha }
   */
  login(credenciais: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciais).pipe(
      tap((resposta: AuthResponse) => {
        /* Salva o token JWT — será usado pelo HTTP Interceptor em cada requisição */
        localStorage.setItem(this.TOKEN_KEY, resposta.token);

        /* Salva os dados básicos do admin para exibir na interface */
        localStorage.setItem(this.USER_KEY, JSON.stringify({
          nome: resposta.nome,
          email: resposta.email,
          perfil: resposta.perfil
        }));
      })
    );
  }

  /**
   * Realiza logout: remove token e dados do localStorage
   * O Spring Boot invalida a sessão no servidor
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Verifica se o usuário está autenticado
   * Usado pelos Guards para proteger rotas privadas
   * @returns true se existe um token salvo (não valida expiração aqui — o backend valida)
   */
  isAutenticado(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retorna o token JWT salvo no localStorage
   * Usado pelo HTTP Interceptor para adicionar ao header Authorization
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retorna os dados do usuário logado (nome, email, perfil)
   * Usado para exibir informações na barra de navegação
   */
  getUsuario(): any {
    const dados = localStorage.getItem(this.USER_KEY);
    return dados ? JSON.parse(dados) : null;
  }

  /** Salva token e dados do admin (chamado pelo LoginService) */
  salvarSessao(token: string, admin: any): void {
    localStorage.setItem(this.TOKEN_KEY, token); // Ajustado para usar a constante da classe
    localStorage.setItem(this.USER_KEY, JSON.stringify(admin)); // Ajustado para usar a constante da classe
  }

  /** Verifica se há token ativo */
  estaAutenticado(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY); // Ajustado para usar a constante da classe
  }

} // <--- A classe agora fecha aqui, englobando tudo!
