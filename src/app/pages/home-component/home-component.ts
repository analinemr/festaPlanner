/**
 * COMPONENTE: Home (Página Principal)
 *
 * Responsável pela lógica da página inicial do Festa Planner.
 * Gerencia: carrossel hero, scroll da navbar, temas e dados estáticos.
 *
 * Integração Spring Boot: futuramente os dados de categorias e temas
 * poderão vir da API via CatalogoService.
 */
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',               // Tag HTML usada no app.component.html
  imports: [CommonModule, RouterModule], // Módulos necessários para *ngFor, routerLink, etc.
  templateUrl: './home-component.html', // Arquivo HTML deste componente
  styleUrl: './home-component.css'   // Arquivo CSS deste componente
})
export class HomeComponent implements OnInit, OnDestroy {

  /**
   * @ViewChild obtém referência ao elemento #temasTrack do template HTML
   * Usado para controlar o scroll horizontal do carrossel de temas
   */
  @ViewChild('temasTrack') temasTrack!: ElementRef<HTMLDivElement>;

  /** Controla se a navbar tem fundo (após scroll) ou é transparente */
  scrolled = false;

  /** Ano atual para exibir no copyright do rodapé */
  anoAtual = new Date().getFullYear();

  // =============================================================
  // DADOS DO CARROSSEL HERO — futuramente via API Spring Boot
  // =============================================================
  slides = [
    { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80' },
    { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80' },
    { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80' },
    { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=80' },
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80' }
  ];

  // =============================================================
  // ESTATÍSTICAS DA PLATAFORMA — futuramente via API Spring Boot
  // =============================================================
  stats = [
    { numero: '1.200+', label: 'Festas Realizadas' },
    { numero: '98%',    label: 'Satisfação dos Clientes' },
    { numero: '50+',    label: 'Temas Disponíveis' },
    { numero: '5 min',  label: 'Para um Orçamento Completo' }
  ];

  // =============================================================
  // CATEGORIAS DE EVENTOS
  // O campo 'tipo' é passado como queryParam para /orcamento
  // para pré-selecionar o tipo de evento no wizard de orçamento
  // =============================================================
  categorias = [
    {
      nome: 'Casamento',
      descricao: 'Sofisticado & Intimista',
      tipo: 'casamento',
      imagem: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80'
    },
    {
      nome: '15 Anos',
      descricao: 'Glamour & Emoção',
      tipo: 'debutante',
      imagem: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'
    },
    {
      nome: 'Infantil',
      descricao: 'Mágico & Divertido',
      tipo: 'infantil',
      imagem: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80'
    },
    {
      nome: 'Floral',
      descricao: 'Elegância Natural',
      tipo: 'floral',
      imagem: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80'
    },
    {
      nome: 'Temático',
      descricao: 'Criativo & Exclusivo',
      tipo: 'tematico',
      imagem: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80'
    },
    {
      nome: 'Corporativo',
      descricao: 'Prestígio & Networking',
      tipo: 'corporativo',
      imagem: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80'
    }
  ];

  // =============================================================
  // TEMAS POPULARES — Carrossel horizontal
  // =============================================================
  temas = [
    { nome: 'Jardim Floral',    tipo: 'Casamento / 15 Anos', imagem: 'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=600&q=80' },
    { nome: 'Branco & Dourado', tipo: 'Casamento',           imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { nome: 'Super Heróis',     tipo: 'Infantil',             imagem: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
    { nome: 'Paris',            tipo: '15 Anos',              imagem: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80' },
    { nome: 'Rústico Chique',   tipo: 'Casamento',           imagem: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
    { nome: 'Tropical',         tipo: 'Todos os eventos',    imagem: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80' },
    { nome: 'Minimalista',      tipo: 'Corporativo',         imagem: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80' }
  ];

  // =============================================================
  // ETAPAS DO PROCESSO
  // =============================================================
  etapas = [
    { icone: '🎉', titulo: 'Escolha o Evento',  descricao: 'Selecione o tipo de celebração que deseja planejar.' },
    { icone: '🛍️', titulo: 'Monte o Pacote',    descricao: 'Escolha buffet, decoração, bolo e muito mais.' },
    { icone: '💰', titulo: 'Veja o Orçamento',  descricao: 'Preço atualizado em tempo real conforme você escolhe.' },
    { icone: '✅', titulo: 'Confirme o Pedido', descricao: 'Envie sua solicitação e aguarde o contato da equipe.' }
  ];

  // =============================================================
  // DEPOIMENTOS DE CLIENTES — futuramente via API
  // =============================================================
  depoimentos = [
    {
      nome: 'Ana Carolina Silva',
      evento: 'Casamento — Outubro 2024',
      texto: 'A plataforma facilitou demais o planejamento. Em 10 minutos já tinha um orçamento completo!'
    },
    {
      nome: 'Marcos & Juliana',
      evento: 'Casamento — Dezembro 2024',
      texto: 'Design incrível e atendimento impecável. Nosso casamento ficou exatamente como sonhamos.'
    },
    {
      nome: 'Fernanda Oliveira',
      evento: 'Debutante — Agosto 2024',
      texto: 'Festa dos 15 anos da minha filha foi um sonho! Tudo organizado com muita praticidade.'
    }
  ];

  // =============================================================
  // CICLO DE VIDA DO ANGULAR
  // =============================================================

  /**
   * ngOnInit → executado quando o componente é inicializado
   * Aqui podemos fazer chamadas à API para carregar dados dinâmicos
   */
  ngOnInit(): void {
    // FUTURO: carregar categorias e temas da API Spring Boot
    // this.cataloService.listarPorCategoria('tema').subscribe(temas => this.temas = temas);
  }

  /**
   * ngOnDestroy → executado quando o componente é destruído
   * Usado para limpar subscriptions e evitar memory leaks
   */
  ngOnDestroy(): void {
    // Limpar subscriptions aqui se houver
  }

  // =============================================================
  // EVENT LISTENERS
  // =============================================================

  /**
   * @HostListener('window:scroll') → escuta o evento de scroll da janela
   * Adiciona/remove a classe 'nav-scrolled' na navbar conforme o scroll
   */
  @HostListener('window:scroll')
  onScroll(): void {
    /* window.scrollY → posição vertical do scroll em pixels */
    this.scrolled = window.scrollY > 60;
  }

  // =============================================================
  // MÉTODOS PÚBLICOS (chamados pelo template HTML)
  // =============================================================

  /**
   * Controla o scroll horizontal do carrossel de temas
   * @param direcao — -1 para esquerda, +1 para direita
   */
  scrollTemas(direcao: number): void {
    /* nativeElement → acessa o elemento DOM real via ElementRef */
    const track = this.temasTrack.nativeElement;

    /* scrollBy → desloca o elemento 300px na direção indicada com animação suave */
    track.scrollBy({ left: direcao * 300, behavior: 'smooth' });
  }
}
