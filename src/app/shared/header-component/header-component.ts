
/**
 * COMPONENTE: Header (Hero com Carrossel)
 *
 * Componente reutilizável do hero com carrossel de imagens.
 * Idêntico ao comportamento do index.html modelo:
 *  - Auto-avança a cada 5 segundos
 *  - Transição por opacity (fade)
 *  - Dots clicáveis + setas anterior/próximo
 *  - Animação de entrada heroIn via CSS
 *
 * Totalmente configurável via @Input() — o mesmo componente
 * serve para a home (com botões) e páginas internas (sem botões,
 * com textos diferentes).
 *
 * Uso no HomeComponent:
 *   <app-header
 *     eyebrow="Experiências Únicas · Momentos Inesquecíveis"
 *     titulo="Planeje o evento<br/><em>perfeito</em>"
 *     subtitulo="Da ideia ao orçamento em minutos..."
 *     btnPrimarioLabel="Criar Orçamento"
 *     btnPrimarioLink="/orcamento"
 *     btnGhostLabel="Explorar Temas"
 *     btnGhostLink="#temas"
 *   ></app-header>
 *
 * Uso no CatálogoComponent (hero menor, sem botões):
 *   <app-header
 *     titulo="Catálogo de <em>Serviços</em>"
 *     [exibirBotoes]="false"
 *     [slides]="['url1', 'url2']"
 *   ></app-header>
 */
import {
  Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  // ============================================================
  // INPUTS — configuráveis por cada página que usa o componente
  // ============================================================

  /** Texto pequeno acima do título (eyebrow) */
  @Input() eyebrow = 'Experiências Únicas \u00a0·\u00a0 Momentos Inesquecíveis';

  /**
   * Título principal — suporta HTML (ex: "Planeje o evento<br/><em>perfeito</em>")
   * Renderizado via [innerHTML] para que o <em> e <br/> funcionem.
   */
  @Input() titulo = 'Planeje o evento<br /><em>perfeito</em>';

  /** Subtítulo descritivo abaixo do título */
  @Input() subtitulo = 'Da ideia ao orçamento em minutos. Casamentos, festas de 15 anos, eventos florais e celebrações infantis de alto padrão.';

  /** Se false, oculta os botões (útil em páginas internas com hero menor) */
  @Input() exibirBotoes = true;

  /** Label e destino do botão primário (dourado) */
  @Input() btnPrimarioLabel = 'Criar Orçamento';
  @Input() btnPrimarioLink  = '/orcamento';

  /** Label e destino do botão ghost (outline branco) */
  @Input() btnGhostLabel = 'Explorar Temas';
  @Input() btnGhostLink  = '#temas';

  /**
   * Array de URLs das imagens do carrossel.
   * Mesmo conjunto do index.html modelo por padrão.
   * Cada página pode passar suas próprias imagens via Input.
   */
  @Input() slides: string[] = [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80'
  ];

  // ============================================================
  // ESTADO INTERNO DO CARROSSEL
  // ============================================================

  /** Índice do slide atualmente visível */
  slideAtual = 0;

  /** Referência ao timer do auto-avanço */
  private timer: ReturnType<typeof setInterval> | null = null;

  // ============================================================
  // CICLO DE VIDA
  // ============================================================

  ngOnInit(): void {
    this.iniciarTimer();
  }

  ngOnDestroy(): void {
    /* Limpa o timer ao destruir o componente — evita memory leak */
    this.pararTimer();
  }

  // ============================================================
  // CONTROLE DO CARROSSEL
  // ============================================================

  /** Navega para um slide específico (usado pelos dots) */
  irPara(indice: number): void {
    this.slideAtual = (indice + this.slides.length) % this.slides.length;
    this.reiniciarTimer();
  }

  /** Avança para o próximo slide */
  proximo(): void {
    this.irPara(this.slideAtual + 1);
  }

  /** Volta para o slide anterior */
  anterior(): void {
    this.irPara(this.slideAtual - 1);
  }

  // ============================================================
  // TIMER (auto-avanço a cada 5s — igual ao index.html)
  // ============================================================

  private iniciarTimer(): void {
    this.timer = setInterval(() => this.proximo(), 5000);
  }

  private pararTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Para e reinicia o timer (evita pulo brusco após clique manual) */
  private reiniciarTimer(): void {
    this.pararTimer();
    this.iniciarTimer();
  }
}
