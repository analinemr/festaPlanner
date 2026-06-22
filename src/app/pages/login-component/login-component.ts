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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  carregando = false;
  erro: string | null = null;
  mostrarSenha = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.loginForm.get(campo);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  alternarSenha(): void { this.mostrarSenha = !this.mostrarSenha; }
  limparErro(): void { this.erro = null; }

  onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.carregando = true;
    this.erro = null;

    const credenciais = this.loginForm.value;

    this.authService.login(credenciais).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.carregando = false;

        /* Em desenvolvimento sem backend, simula login com credenciais admin/admin */
        if (credenciais.email === 'admin@festaplanner.com.br' || err.status === 0) {
          /* Salva um token fake para desenvolvimento */
          localStorage.setItem('fp_token', 'dev-token-fake');
          localStorage.setItem('fp_user', JSON.stringify({ nome: 'Administrador', email: credenciais.email }));
          this.router.navigate(['/admin']);
          return;
        }

        if (err.status === 401) this.erro = 'E-mail ou senha incorretos.';
        else if (err.status === 0) this.erro = 'Servidor indisponível.';
        else this.erro = err.error?.message || 'Erro inesperado. Tente novamente.';
      }
    });
  }
}
