/**
 * COMPONENTE: Login
 *
 * Tela de autenticação do administrador.
 * Usa Reactive Forms do Angular para validação robusta.
 * Envia credenciais ao Spring Boot via AuthService e
 * armazena o token JWT retornado para uso nas requisições seguintes.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,     // Serviço Angular para criar formulários reativos
  FormGroup,       // Representa o grupo de controles do formulário
  Validators,      // Funções de validação (required, email, minLength)
  ReactiveFormsModule  // Módulo necessário para formGroup e formControlName
} from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule  // Necessário para usar [formGroup] e formControlName no template
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {

  /**
   * FormGroup — representa o formulário completo com seus campos e validações.
   * É vinculado ao template via [formGroup]="loginForm"
   */
  loginForm!: FormGroup;

  /** Controla o spinner de carregamento enquanto aguarda resposta do backend */
  carregando = false;

  /** Armazena mensagem de erro retornada pelo Spring Boot */
  erro: string | null = null;

  /** Controla se a senha está visível ou oculta */
  mostrarSenha = false;

  /**
   * FormBuilder — injeta o serviço que cria o formulário de forma simplificada
   * Router — usado para navegar para /admin após login bem-sucedido
   * AuthService — faz a requisição POST /api/auth/login ao Spring Boot
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * ngOnInit — inicializa o formulário com campos e validações
   */
  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Cria o FormGroup com dois campos: email e senha.
   * Validators.required → campo obrigatório
   * Validators.email → valida formato de e-mail
   * Validators.minLength(6) → mínimo de 6 caracteres na senha
   */
  private inicializarFormulario(): void {
    this.loginForm = this.fb.group({
      email: [
        '',                              // Valor inicial vazio
        [Validators.required, Validators.email] // Array de validadores
      ],
      senha: [
        '',
        [Validators.required, Validators.minLength(6)]
      ]
    });
  }

  /**
   * Verifica se um campo do formulário está inválido E já foi tocado.
   * Usado no template para exibir mensagens de erro somente após o usuário
   * interagir com o campo (evita erros antes de começar a preencher).
   *
   * @param campo — nome do FormControl: 'email' ou 'senha'
   * @returns true se o campo tem erro E foi tocado/modificado
   */
  campoInvalido(campo: string): boolean {
    const control = this.loginForm.get(campo);
    /* touched → o campo recebeu e perdeu o foco | dirty → o valor foi alterado */
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  /**
   * Alterna a visibilidade da senha
   * Muda o [type] do input entre 'password' e 'text'
   */
  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  /** Remove a mensagem de erro atual */
  limparErro(): void {
    this.erro = null;
  }

  /**
   * Submete o formulário de login ao backend Spring Boot.
   *
   * Fluxo:
   * 1. Valida o formulário localmente
   * 2. Chama POST /api/auth/login com email e senha
   * 3. Spring Boot valida, retorna token JWT
   * 4. AuthService salva o token no localStorage
   * 5. Router navega para /admin
   *
   * Em caso de erro (401 Unauthorized):
   * - Exibe mensagem de erro para o usuário
   */
  onLogin(): void {
    /* Se o formulário é inválido, marca todos os campos como tocados para exibir erros */
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.erro = null;

    /* Extrai os valores do formulário */
    const credenciais = {
      email: this.loginForm.value.email,
      senha: this.loginForm.value.senha
    };

    /**
     * Chama o AuthService que faz POST /api/auth/login
     * .subscribe() escuta a resposta assíncrona do Observable
     */
    this.authService.login(credenciais).subscribe({
      /**
       * next → executado quando a resposta é bem-sucedida (HTTP 200)
       * O AuthService já salvou o token JWT no localStorage
       */
      next: () => {
        this.carregando = false;
        /* Navega para o painel administrativo após login */
        this.router.navigate(['/admin']);
      },

      /**
       * error → executado quando o Spring Boot retorna erro (HTTP 401, 403, 500)
       * @param err — objeto de erro HTTP do Angular
       */
      error: (err) => {
        this.carregando = false;

        /* Exibe mensagem amigável baseada no status HTTP retornado pelo Spring Boot */
        if (err.status === 401) {
          this.erro = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        } else if (err.status === 403) {
          this.erro = 'Acesso negado. Conta sem permissão de administrador.';
        } else if (err.status === 0) {
          this.erro = 'Servidor indisponível. Tente novamente em instantes.';
        } else {
          /* Tenta exibir mensagem do backend, ou mensagem genérica */
          this.erro = err.error?.message || 'Erro inesperado. Tente novamente.';
        }
      }
    });
  }
}
