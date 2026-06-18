/**
 * COMPONENTE: Orçamento
 *
 * Gerencia o wizard de 4 etapas para montagem e envio de orçamento.
 * Etapas: 0-Dados do evento | 1-Seleção de itens | 2-Revisão | 3-Confirmação
 *
 * Integração Spring Boot:
 *  - CatalogoService → carrega itens do banco MySQL
 *  - OrcamentoService → envia o orçamento ao backend
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo-service';
import { OrcamentoService } from '../../core/services/orcamento-service';
import { Catalogo } from '../../models/catalogo';

/** Interface interna para agrupar itens por categoria */
interface CategoriaAgrupada {
  id: string;
  nome: string;
  icone: string;
  obrigatorio: boolean;
  itens: Catalogo[];
}

@Component({
  selector: 'app-orcamento',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,   // Pipe para formatar valores monetários: {{ valor | currency:'BRL' }}
    TitleCasePipe,  // Pipe para capitalizar texto: {{ texto | titlecase }}
    DatePipe        // Pipe para formatar datas: {{ data | date:'dd/MM/yyyy' }}
  ],
  templateUrl: './orcamento-component.html',
  styleUrls: ['./orcamento-component.css']
})
export class OrcamentoComponent implements OnInit {

  // ============================================================
  // WIZARD — Controle de etapas
  // ============================================================

  /** Etapa atual do wizard (0 a 3) */
  etapaAtual = 0;

  /** Labels das etapas exibidas na barra de progresso */
  etapasWizard = ['Seu Evento', 'Serviços', 'Revisão', 'Confirmação'];

  // ============================================================
  // FORMULÁRIO DA ETAPA 0: Dados do evento
  // ============================================================
  dadosEventoForm!: FormGroup;

  /** Data mínima = hoje (não permite datas passadas) */
  dataMinima = new Date().toISOString().split('T')[0];

  /** Opções de tipo de evento exibidas como cards de radio */
  tiposEvento = [
    { valor: 'casamento',    nome: 'Casamento',   icone: '💍' },
    { valor: 'debutante',   nome: '15 Anos',      icone: '👸' },
    { valor: 'infantil',    nome: 'Infantil',      icone: '🎈' },
    { valor: 'floral',      nome: 'Floral',        icone: '🌸' },
    { valor: 'tematico',    nome: 'Temático',      icone: '🎭' },
    { valor: 'corporativo', nome: 'Corporativo',   icone: '🏢' }
  ];

  // ============================================================
  // CATÁLOGO — Etapa 1
  // ============================================================

  /** Estado de carregamento dos itens do backend */
  carregandoItens = false;

  /** Todos os itens do catálogo vindos do Spring Boot */
  todosItens: Catalogo[] = [];

  /** Itens agrupados por categoria para exibição em carrosséis */
  categoriasFiltradas: CategoriaAgrupada[] = [];

  /** IDs dos itens atualmente selecionados pelo usuário */
  itensSelecionados: number[] = [];

  // ============================================================
  // CÁLCULO DE PREÇOS — Atualizado em tempo real
  // ============================================================

  /** Soma simples de todos os itens selecionados */
  subtotal = 0;

  /** 5% do subtotal — taxa de serviço da casa de festas */
  taxaServico = 0;

  /** Total final: subtotal + taxaServico */
  total = 0;

  // ============================================================
  // ENVIO — Etapas 2 e 3
  // ============================================================

  /** Estado de carregamento ao enviar o orçamento */
  enviando = false;

  /** Número do pedido retornado pelo Spring Boot após criação */
  numeroPedido: number | null = null;

  /**
   * ActivatedRoute → lê queryParams da URL
   * Ex: /orcamento?tipo=casamento → pré-seleciona o tipo de evento
   */
  constructor(
    private fb: FormBuilder,
    private cataloService: CatalogoService,
    private orcamentoService: OrcamentoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.lerQueryParams();
    this.carregarCatalogo();
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  /** Cria o formulário reativo da etapa 0 */
  private inicializarFormulario(): void {
    this.dadosEventoForm = this.fb.group({
      tipoEvento:       ['', Validators.required],
      nomeCliente:      ['', Validators.required],
      emailCliente:     ['', [Validators.required, Validators.email]],
      telefoneCliente:  ['', Validators.required],
      dataEvento:       ['', Validators.required],
      numeroConvidados: [100, [Validators.required, Validators.min(10)]],
      observacoes:      ['']
    });
  }

  /**
   * Lê o queryParam 'tipo' da URL para pré-selecionar o evento.
   * Ex: ao clicar em "Casamento" na home, a URL chega como /orcamento?tipo=casamento
   */
  private lerQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tipo']) {
        this.dadosEventoForm.patchValue({ tipoEvento: params['tipo'] });
      }
    });
  }

  /**
   * Carrega todos os itens do catálogo via Spring Boot.
   * Após carregar, agrupa por categoria para os carrosséis.
   * Seleciona automaticamente os itens obrigatórios.
   */
  private carregarCatalogo(): void {
    this.carregandoItens = true;

    this.cataloService.listarTodos().subscribe({
      next: (itens) => {
        this.todosItens = itens;
        this.agruparPorCategoria(itens);

        /* Pré-seleciona todos os itens obrigatórios */
        const obrigatorios = itens.filter(i => i.obrigatorio).map(i => i.id!);
        this.itensSelecionados = [...obrigatorios];
        this.calcularTotal();

        this.carregandoItens = false;
      },
      error: () => {
        /* Fallback com dados de exemplo para desenvolvimento sem backend */
        this.carregarDadosExemplo();
        this.carregandoItens = false;
      }
    });
  }

  /**
   * Agrupa os itens do catálogo por categoria para exibição em carrosséis.
   * Cada categoria vira um bloco com carrossel horizontal.
   */
  private agruparPorCategoria(itens: Catalogo[]): void {
    const mapa: Record<string, CategoriaAgrupada> = {};
    const meta: Record<string, { nome: string; icone: string; obrigatorio: boolean }> = {
      buffet:    { nome: 'Buffet & Gastronomia', icone: '🍽️',  obrigatorio: true  },
      bolo:      { nome: 'Bolo & Doces',          icone: '🎂',  obrigatorio: true  },
      decoracao: { nome: 'Decoração & Flores',     icone: '💐',  obrigatorio: false },
      musica:    { nome: 'Música & Entretenimento',icone: '🎵',  obrigatorio: false },
      foto:      { nome: 'Foto & Vídeo',           icone: '📷',  obrigatorio: false },
      outro:     { nome: 'Outros Serviços',        icone: '✨',  obrigatorio: false }
    };

    itens.forEach(item => {
      if (!mapa[item.categoria]) {
        mapa[item.categoria] = {
          id: item.categoria,
          nome: meta[item.categoria]?.nome  || item.categoria,
          icone: meta[item.categoria]?.icone || '🎉',
          obrigatorio: meta[item.categoria]?.obrigatorio || false,
          itens: []
        };
      }
      mapa[item.categoria].itens.push(item);
    });

    this.categoriasFiltradas = Object.values(mapa);
  }

  /**
   * Dados de exemplo para desenvolvimento sem backend Spring Boot ativo.
   * Remova este método quando o backend estiver funcionando.
   */
  private carregarDadosExemplo(): void {
    const exemplos: Catalogo[] = [
      { id:1, nome:'Buffet Executivo', descricao:'Entrada, prato principal e sobremesa', preco:4500, imagemUrl:'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80', categoria:'buffet', obrigatorio:true, ativo:true },
      { id:2, nome:'Buffet Premium', descricao:'Menu completo com opções gourmet', preco:7200, imagemUrl:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80', categoria:'buffet', obrigatorio:false, ativo:true },
      { id:3, nome:'Bolo Clássico 3 andares', descricao:'Bolo decorado com pasta americana', preco:1200, imagemUrl:'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&q=80', categoria:'bolo', obrigatorio:true, ativo:true },
      { id:4, nome:'Bolo Naked Cake', descricao:'Bolo semi-naked com frutas frescas', preco:980, imagemUrl:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', categoria:'bolo', obrigatorio:false, ativo:true },
      { id:5, nome:'Decoração Floral', descricao:'Arranjos florais e centro de mesa', preco:2800, imagemUrl:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=400&q=80', categoria:'decoracao', obrigatorio:false, ativo:true },
      { id:6, nome:'DJ Profissional', descricao:'4 horas de música personalizada', preco:2200, imagemUrl:'https://images.unsplash.com/photo-1571266752461-eff34b1f01cd?w=400&q=80', categoria:'musica', obrigatorio:false, ativo:true },
      { id:7, nome:'Fotógrafo + Álbum', descricao:'Cobertura completa + 100 fotos editadas', preco:3500, imagemUrl:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', categoria:'foto', obrigatorio:false, ativo:true }
    ];
    this.todosItens = exemplos;
    this.agruparPorCategoria(exemplos);
    const obrigatorios = exemplos.filter(i => i.obrigatorio).map(i => i.id!);
    this.itensSelecionados = [...obrigatorios];
    this.calcularTotal();
  }

  // ============================================================
  // SELEÇÃO DE ITENS
  // ============================================================

  /** Verifica se um item está na lista de selecionados */
  itemSelecionado(id: number): boolean {
    return this.itensSelecionados.includes(id);
  }

  /**
   * Adiciona ou remove um item da seleção.
   * Itens obrigatórios não podem ser removidos.
   */
  toggleItem(item: Catalogo): void {
    if (item.obrigatorio) return; /* Bloqueia clique em obrigatórios */

    if (this.itemSelecionado(item.id!)) {
      /* Remove o item da lista de selecionados */
      this.itensSelecionados = this.itensSelecionados.filter(id => id !== item.id);
    } else {
      /* Adiciona o item à lista de selecionados */
      this.itensSelecionados.push(item.id!);
    }

    /* Recalcula o total em tempo real após cada mudança */
    this.calcularTotal();
  }

  /** Remove um item pelo ID (botão na etapa de revisão) */
  removerItem(id: number): void {
    const item = this.todosItens.find(i => i.id === id);
    if (item?.obrigatorio) return;
    this.itensSelecionados = this.itensSelecionados.filter(i => i !== id);
    this.calcularTotal();
  }

  /**
   * Retorna os objetos completos dos itens selecionados.
   * Usado para exibir detalhes (nome, imagem, preço) no aside e revisão.
   */
  get itensSelecionadosCompletos(): Catalogo[] {
    return this.todosItens.filter(item => this.itensSelecionados.includes(item.id!));
  }

  // ============================================================
  // CÁLCULO DE PREÇOS — Tempo real
  // ============================================================

  /** Calcula subtotal, taxa e total dos itens selecionados */
  calcularTotal(): void {
    this.subtotal = this.itensSelecionadosCompletos.reduce((acc, item) => acc + item.preco, 0);
    this.taxaServico = this.subtotal * 0.05;
    this.total = this.subtotal + this.taxaServico;
  }

  // ============================================================
  // NAVEGAÇÃO DO WIZARD
  // ============================================================

  /** Avança para a próxima etapa (com validação na etapa 0) */
  avancarEtapa(): void {
    if (this.etapaAtual === 0 && this.dadosEventoForm.invalid) {
      this.dadosEventoForm.markAllAsTouched();
      return;
    }

    /* Na última etapa de revisão, envia o orçamento */
    if (this.etapaAtual === 2) {
      this.enviarOrcamento();
      return;
    }

    this.etapaAtual++;
  }

  /** Volta para a etapa anterior */
  voltarEtapa(): void {
    if (this.etapaAtual > 0) {
      this.etapaAtual--;
    }
  }

  // ============================================================
  // SCROLL DOS CARROSSÉIS DE CATEGORIA
  // ============================================================

  /**
   * Controla o scroll horizontal do carrossel de uma categoria específica.
   * @param categoriaId — ID da categoria (ex: 'buffet')
   * @param direcao — -1 esquerda, +1 direita
   */
  scrollCategoria(categoriaId: string, direcao: number): void {
    const track = document.getElementById(`track-${categoriaId}`);
    track?.scrollBy({ left: direcao * 280, behavior: 'smooth' });
  }

  // ============================================================
  // VALIDAÇÃO DE FORMULÁRIO
  // ============================================================

  /** Verifica se um campo está inválido e tocado */
  campoInvalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  // ============================================================
  // ENVIO DO ORÇAMENTO AO SPRING BOOT
  // ============================================================

  /**
   * Envia o orçamento completo ao backend Spring Boot.
   * POST /api/orcamentos com todos os dados do evento e itens selecionados.
   * O Spring Boot persiste no MySQL e retorna o ID do pedido criado.
   */
  enviarOrcamento(): void {
    this.enviando = true;

    /* Monta o objeto de orçamento a ser enviado ao Spring Boot */
    const orcamento = {
      ...this.dadosEventoForm.value,  /* Espalha os campos do formulário */
      itensIds: this.itensSelecionados,
      valorTotal: this.total,
      status: 'pendente'
    };

    this.orcamentoService.criar(orcamento).subscribe({
      next: (resposta) => {
        this.enviando = false;
        /* Armazena o número do pedido retornado pelo Spring Boot */
        this.numeroPedido = resposta.id || null;
        /* Avança para a etapa de confirmação */
        this.etapaAtual = 3;
      },
      error: () => {
        this.enviando = false;
        alert('Erro ao enviar orçamento. Tente novamente.');
      }
    });
  }
}
