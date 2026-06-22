import {
  Component, OnInit, OnDestroy, AfterViewInit,
  HostListener, ViewChild, ElementRef, ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('temasTrack') temasTrack!: ElementRef<HTMLDivElement>;

  scrolled   = false;
  menuAberto = false;
  slideAtual = 0;
  anoAtual   = new Date().getFullYear();

  private timer: ReturnType<typeof setInterval> | null = null;
  private temasOffset = 0;
  private observer: IntersectionObserver | null = null;

  bgUrl(url: string): string {
    return `url('${url}')`;
  }

  slides = [
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80'
  ];

  categorias = [
    { nome:'Casamento',   desc:'Sofisticado & Intimista', tipo:'casamento',   img:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80' },
    { nome:'15 Anos',     desc:'Glamour & Emoção',        tipo:'debutante',   img:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80' },
    { nome:'Infantil',    desc:'Mágico & Divertido',      tipo:'infantil',    img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80' },
    { nome:'Floral',      desc:'Elegância Natural',        tipo:'floral',      img:'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80' },
    { nome:'Temático',    desc:'Criativo & Exclusivo',     tipo:'tematico',    img:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80' },
    { nome:'Corporativo', desc:'Prestígio & Networking',   tipo:'corporativo', img:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80' }
  ];

  temas = [
    { nome:'Jardim Floral',    tipo:'Casamento / 15 Anos', img:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=600&q=80' },
    { nome:'Branco & Dourado', tipo:'Casamento',           img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80' },
    { nome:'Super Heróis',     tipo:'Infantil',             img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80' },
    { nome:'Glamour Neon',     tipo:'15 Anos / Temático',  img:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80' },
    { nome:'Espaço Sideral',   tipo:'Infantil / Temático', img:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80' },
    { nome:'Jardim Encantado', tipo:'Infantil / Floral',   img:'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80' },
    { nome:'Balada Teen',      tipo:'15 Anos / Temático',  img:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80' },
    { nome:'Rústico Chique',   tipo:'Casamento',           img:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80' }
  ];

  depoimentos = [
    { inicial:'C', nome:'Carla Mendes',   evento:'Casamento — 250 convidados',       texto:'Planejei meu casamento em menos de 10 minutos. A transparência dos preços e a organização da plataforma são impressionantes.' },
    { inicial:'R', nome:'Ricardo Fontes', evento:'Festa Infantil — 80 convidados',   texto:'Minha filha amou a festa temática! Tudo que escolhemos no orçamento foi entregue com perfeição. Recomendo demais!' },
    { inicial:'A', nome:'Ana Luíza',      evento:'Festa de 15 Anos — 150 convidados',texto:'A experiência foi incrível do início ao fim. O sistema de filtros por tema e número de convidados facilita demais a escolha.' }
  ];

  ngOnInit(): void {
    this.timer = setInterval(() => this.proximo(), 5000);
  }

  ngAfterViewInit(): void {
    /**
     * IntersectionObserver — replica o comportamento do JavaScript original.
     * Adiciona a classe .visible nos elementos quando entram na viewport,
     * ativando as animações de fade-in definidas no CSS.
     */
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    // Observa os mesmos seletores do script original
    setTimeout(() => {
      document.querySelectorAll('.step-card, .event-card, .testimonial, .stat')
        .forEach(el => this.observer!.observe(el));
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.observer) this.observer.disconnect();
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 60; }

  irPara(n: number): void {
    this.slideAtual = (n + this.slides.length) % this.slides.length;
    if (this.timer) { clearInterval(this.timer); this.timer = setInterval(() => this.proximo(), 5000); }
  }
  proximo(): void  { this.irPara(this.slideAtual + 1); }
  anterior(): void { this.irPara(this.slideAtual - 1); }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    document.body.style.overflow = this.menuAberto ? 'hidden' : '';
  }
  fecharMenu(): void {
    this.menuAberto = false;
    document.body.style.overflow = '';
  }

  shiftTemas(dir: number): void {
    const track = this.temasTrack?.nativeElement;
    if (!track) return;
    const max = track.scrollWidth - (track.parentElement?.offsetWidth || 0);
    this.temasOffset = Math.max(0, Math.min(this.temasOffset + dir * 280 * 2, max));
    track.style.transform = `translateX(-${this.temasOffset}px)`;
  }
}
