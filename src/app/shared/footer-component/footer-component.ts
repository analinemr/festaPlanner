/**
 * COMPONENTE: Footer
 *
 * Rodapé global reutilizável em todas as páginas públicas.
 * Fiel ao layout do index.html modelo:
 *  - Logo + descrição
 *  - 3 colunas de links (Plataforma, Empresa, Suporte)
 *  - Copyright com ano dinâmico
 *
 * Uso: adicione <app-footer></app-footer> no final de qualquer página.
 * Não usado no painel admin (tem layout próprio sem footer).
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css'
})
export class FooterComponent {

  /** Ano atual para exibir no copyright — atualizado automaticamente */
  anoAtual = new Date().getFullYear();
}

