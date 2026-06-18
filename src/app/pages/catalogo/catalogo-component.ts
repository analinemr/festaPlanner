/**
 * COMPONENTE: Catálogo
 *
 * Página pública que exibe todos os produtos e serviços disponíveis.
 * O usuário pode filtrar por categoria, buscar por texto,
 * alternar entre visualização em grid ou lista,
 * e ver o detalhe de cada item em um modal.
 *
 * Integração Spring Boot:
 *  - GET /api/catalogo → lista todos os itens ativos
 *  - GET /api/catalogo/categoria/:cat → filtra por categoria no backend
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo-service';
import { Catalogo } from '../../models/catalogo';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe],
  templateUrl: './catalogo-component.html',
  styleUrl: './catalogo-component.css'
})
export class CatalogoComponent implements OnInit {

  /** Todos os itens vindos do Spring Boot */
  todosItens: Catalogo[] = [];

  /** Itens exibidos após aplicar filtros */
  itensFiltrados: Catalogo[] = [];

  /** Estado de carregamento */
  carregando = false;

  /** Texto de busca — vinculado via [(ngModel)] */
  termoBusca = '';

  /** Categoria selecionada no filtro */
  categoriaSelecionada = '';

  /** Modo de visualização: 'grid' ou 'lista' */
  visualizacao: 'grid' | 'lista' = 'grid';

  /** Item atualmente exibido no modal de detalhe */
  itemDetalhe: Catalogo | null = null;

  /** Opções de categoria para os botões de filtro */
  categorias = [
    { valor: 'buffet',    nome: 'Buffet',      icone: '🍽️' },
    { valor: 'bolo',      nome: 'Bolo & Doces', icone: '🎂' },
    { valor: 'decoracao', nome: 'Decoração',    icone: '💐' },
    { valor: 'musica',    nome: 'Música',       icone: '🎵' },
    { valor: 'foto',      nome: 'Foto & Vídeo', icone: '📷' },
    { valor: 'outro',     nome: 'Outros',       icone: '✨' }
  ];

  constructor(private cataloService: CatalogoService) {}

  ngOnInit(): void {
    this.carregarItens();
  }

  /**
   * Carrega todos os itens ativos do catálogo via Spring Boot.
   * GET /api/catalogo → retorna somente itens com ativo = true
   */
  carregarItens(): void {
    this.carregando = true;

    this.cataloService.listarTodos().subscribe({
      next: (itens) => {
        /* Exibe somente itens ativos na página pública */
        this.todosItens = itens.filter(i => i.ativo);
        this.itensFiltrados = [...this.todosItens];
        this.carregando = false;
      },
      error: () => {
        /* Fallback sem backend */
        this.carregarExemplos();
        this.carregando = false;
      }
    });
  }

  /**
   * Aplica os filtros de busca e categoria em cima de todosItens.
   * Chamado sempre que o usuário digita ou seleciona uma categoria.
   */
  filtrar(): void {
    let resultado = [...this.todosItens];

    /* Filtro de categoria */
    if (this.categoriaSelecionada) {
      resultado = resultado.filter(i => i.categoria === this.categoriaSelecionada);
    }

    /* Filtro de busca por nome ou descrição (case-insensitive) */
    if (this.termoBusca.trim()) {
      const busca = this.termoBusca.toLowerCase();
      resultado = resultado.filter(i =>
        i.nome.toLowerCase().includes(busca) ||
        i.descricao.toLowerCase().includes(busca)
      );
    }

    this.itensFiltrados = resultado;
  }

  /** Seleciona uma categoria e refaz o filtro */
  selecionarCategoria(cat: string): void {
    this.categoriaSelecionada = cat;
    this.filtrar();
  }

  /** Limpa todos os filtros e exibe todos os itens */
  limparFiltros(): void {
    this.termoBusca = '';
    this.categoriaSelecionada = '';
    this.itensFiltrados = [...this.todosItens];
  }

  /** Abre o modal de detalhe de um item */
  abrirDetalhe(item: Catalogo): void {
    this.itemDetalhe = item;
    /* Bloqueia o scroll da página quando o modal está aberto */
    document.body.style.overflow = 'hidden';
  }

  /** Fecha o modal de detalhe */
  fecharDetalhe(): void {
    this.itemDetalhe = null;
    document.body.style.overflow = '';
  }

  /** Traduz o valor da categoria para exibição legível */
  traduzirCategoria(cat: string): string {
    const mapa: Record<string, string> = {
      buffet:    'Buffet & Gastronomia',
      bolo:      'Bolo & Doces',
      decoracao: 'Decoração & Flores',
      musica:    'Música & Entretenimento',
      foto:      'Foto & Vídeo',
      outro:     'Outros Serviços'
    };
    return mapa[cat] || cat;
  }

  /** Dados de exemplo para desenvolvimento sem backend */
  private carregarExemplos(): void {
    this.todosItens = [
      { id:1, nome:'Buffet Executivo',      descricao:'Entrada, prato principal e sobremesa para até 200 pessoas.',    preco:4500,  imagemUrl:'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80', categoria:'buffet',    obrigatorio:true,  ativo:true },
      { id:2, nome:'Buffet Premium Gourmet',descricao:'Menu completo com opções veganas e sem glúten.',                preco:7200,  imagemUrl:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80', categoria:'buffet',    obrigatorio:false, ativo:true },
      { id:3, nome:'Bolo Clássico 3 Andares',descricao:'Bolo decorado com pasta americana, personalizado.',           preco:1200,  imagemUrl:'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80', categoria:'bolo',      obrigatorio:true,  ativo:true },
      { id:4, nome:'Bolo Naked Cake',       descricao:'Naked cake com frutas frescas e chantilly artesanal.',         preco:980,   imagemUrl:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', categoria:'bolo',      obrigatorio:false, ativo:true },
      { id:5, nome:'Decoração Floral Completa',descricao:'Arranjos florais, centro de mesa e arco floral.',           preco:2800,  imagemUrl:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=600&q=80', categoria:'decoracao', obrigatorio:false, ativo:true },
      { id:6, nome:'DJ Profissional',       descricao:'4 horas de música ao vivo personalizada para o evento.',       preco:2200,  imagemUrl:'https://images.unsplash.com/photo-1571266752461-eff34b1f01cd?w=600&q=80', categoria:'musica',    obrigatorio:false, ativo:true },
      { id:7, nome:'Fotógrafo + Álbum Digital',descricao:'Cobertura completa do evento + 100 fotos editadas.',        preco:3500,  imagemUrl:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', categoria:'foto',      obrigatorio:false, ativo:true },
      { id:8, nome:'Iluminação Cênica',     descricao:'Iluminação profissional com LED colorido e spots.',            preco:1800,  imagemUrl:'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=600&q=80', categoria:'decoracao', obrigatorio:false, ativo:true },
      { id:9, nome:'Mesa de Doces Premium', descricao:'Variedade de 20 tipos de doces finos e bem-casados.',          preco:1500,  imagemUrl:'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80', categoria:'bolo',      obrigatorio:false, ativo:true },
      { id:10,nome:'Filmagem 4K + Drone',   descricao:'Filmagem profissional com drone e edição completa.',           preco:4800,  imagemUrl:'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80', categoria:'foto',      obrigatorio:false, ativo:true }
    ];
    this.itensFiltrados = [...this.todosItens];
  }
}
