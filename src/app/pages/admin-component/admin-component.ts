/**
 * COMPONENTE: Admin — Painel Administrativo
 *
 * Centraliza toda a gestão da casa de festas:
 * - Dashboard com KPIs e gráficos
 * - Gerenciamento de pedidos e status
 * - Cadastro de produtos no catálogo
 * - Agenda/calendário de eventos
 *
 * Integração Spring Boot:
 *  - OrcamentoService → lista e atualiza pedidos
 *  - CatalogoService → CRUD de itens do catálogo
 *  - AgendaService → lista e gerencia eventos
 *  - AuthService → dados do usuário logado + logout
 */
import {
  Component, OnInit, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { CatalogoService } from '../../core/services/catalogo-service';
import { OrcamentoService } from '../../core/services/orcamento-service';
import { AgendaService } from '../../core/services/agenda-service';
import { Catalogo } from '../../models/catalogo';
import { Pedido } from '../../models/pedidos';
import { Agenda } from '../../models/agenda';

/** Interface para dia do calendário */
interface DiaCalendario {
  numero: number;
  data: string;       // formato YYYY-MM-DD
  hoje: boolean;
  mesAtual: boolean;
  temEvento: boolean;
  evento?: Agenda;
}

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule, RouterModule,
    FormsModule,           // Para [(ngModel)] nos filtros
    ReactiveFormsModule,   // Para [formGroup] no formulário de cadastro
    CurrencyPipe, TitleCasePipe, DatePipe
  ],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css'
})
export class AdminComponent implements OnInit, AfterViewInit {

  /** Referências aos canvas dos gráficos via @ViewChild */
  @ViewChild('graficoBarra') graficoBarra!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoDonut') graficoDonut!: ElementRef<HTMLCanvasElement>;

  // ============================================================
  // SIDEBAR E NAVEGAÇÃO
  // ============================================================

  /** Controla se a sidebar está colapsada */
  sidebarFechada = false;

  /** Seção atualmente exibida no conteúdo principal */
  secaoAtiva = 'dashboard';

  /** Título dinâmico exibido na topbar conforme a seção ativa */
  tituloSecao = 'Dashboard';

  /** Itens do menu lateral */
  menuItems = [
    { id: 'dashboard', nome: 'Dashboard',   icone: '📊', badge: 0 },
    { id: 'pedidos',   nome: 'Pedidos',      icone: '📋', badge: 0 },
    { id: 'agenda',    nome: 'Agenda',       icone: '📅', badge: 0 },
    { id: 'cadastro',  nome: 'Catálogo',     icone: '🛍️', badge: 0 },
    { id: 'relatorios',nome: 'Relatórios',   icone: '📈', badge: 0 }
  ];

  // ============================================================
  // USUÁRIO LOGADO
  // ============================================================

  nomeUsuario = '';
  inicialUsuario = '';
  anoAtual = new Date().getFullYear();

  // ============================================================
  // DASHBOARD — KPIs
  // ============================================================

  kpis = [
    { icone: '💰', valor: 'R$ 0', label: 'Faturamento do Mês', variacao: '0%', positiva: true },
    { icone: '📋', valor: '0',    label: 'Pedidos Este Mês',   variacao: '0%', positiva: true },
    { icone: '✅', valor: '0',    label: 'Eventos Confirmados',variacao: '0%', positiva: true },
    { icone: '⏳', valor: '0',    label: 'Pendentes',          variacao: '0%', positiva: false }
  ];

  legendaDonut = [
    { label: 'Casamento',  cor: '#444444', valor: 40 },
    { label: '15 Anos',    cor: '#888888', valor: 30 },
    { label: 'Infantil',   cor: '#c0c0c0', valor: 20 },
    { label: 'Outros',     cor: '#1a1a1a', valor: 10 }
  ];

  // ============================================================
  // CALENDÁRIO
  // ============================================================

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasSemanaCompletos = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  /** Data atual de referência para o calendário */
  dataCalendario = new Date();

  /** Label do mês/ano do calendário */
  mesAtualLabel = '';

  /** Dias do mês para o grid do calendário */
  diasDoMes: DiaCalendario[] = [];

  /** Eventos carregados do Spring Boot para o calendário */
  eventosAgenda: Agenda[] = [];

  // ============================================================
  // PEDIDOS
  // ============================================================

  todosPedidos: Pedido[] = [];
  pedidosRecentes: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  termoBusca = '';
  filtroStatus = '';
  totalPendentes = 0;

  // ============================================================
  // CATÁLOGO / CADASTRO
  // ============================================================

  itensCatalogo: Catalogo[] = [];
  cadastroForm!: FormGroup;
  editandoItem = false;
  idEditando: number | null = null;
  salvando = false;
  previewImagem: string | null = null;
  nomeArquivo = '';
  imagemArquivo: File | null = null;

  constructor(
    private authService: AuthService,
    private cataloService: CatalogoService,
    private orcamentoService: OrcamentoService,
    private agendaService: AgendaService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  // ============================================================
  // CICLO DE VIDA
  // ============================================================

  ngOnInit(): void {
    this.carregarUsuario();
    this.inicializarFormulario();
    this.gerarCalendario();
    this.carregarDados();
  }

  /**
   * AfterViewInit → executado após o Angular renderizar o template.
   * Necessário para acessar os elementos canvas dos gráficos via @ViewChild.
   */
  ngAfterViewInit(): void {
    /* Pequeno delay para garantir que o canvas esteja no DOM */
    setTimeout(() => this.desenharGraficos(), 100);
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  /** Carrega dados do usuário logado via AuthService */
  private carregarUsuario(): void {
    const usuario = this.authService.getUsuario();
    if (usuario) {
      this.nomeUsuario = usuario.nome;
      this.inicialUsuario = usuario.nome.charAt(0).toUpperCase();
    }
  }

  /** Inicializa o FormGroup do cadastro de itens */
  private inicializarFormulario(): void {
    this.cadastroForm = this.fb.group({
      nome:       ['', Validators.required],
      descricao:  ['', Validators.required],
      preco:      [0, [Validators.required, Validators.min(0)]],
      categoria:  ['', Validators.required],
      obrigatorio:[false],
      ativo:      [true]
    });
  }

  /**
   * Carrega todos os dados do backend Spring Boot em paralelo.
   * Os dados inicializados aqui alimentam o dashboard e o calendário.
   */
  private carregarDados(): void {
    /* Carrega pedidos */
    this.orcamentoService.listarTodos().subscribe({
      next: (pedidos: any[]) => {
        this.todosPedidos = pedidos;
        this.pedidosFiltrados = pedidos;
        this.pedidosRecentes = pedidos.slice(0, 5); // Exibe apenas os 5 mais recentes
        this.totalPendentes = pedidos.filter(p => p.status === 'novo' || p.status === 'em_analise').length;
        this.menuItems[1].badge = this.totalPendentes;
        this.atualizarKpis(pedidos);
      },
      error: () => this.carregarDadosExemploPedidos()
    });

    /* Carrega catálogo */
    this.cataloService.listarTodos().subscribe({
      next: (itens) => { this.itensCatalogo = itens; },
      error: () => { this.itensCatalogo = []; }
    });

    /* Carrega agenda do mês atual */
    this.carregarEventosAgenda();
  }

  /** Carrega eventos do mês atual para o calendário */
  private carregarEventosAgenda(): void {
    const ano = this.dataCalendario.getFullYear();
    const mes = this.dataCalendario.getMonth() + 1;

    this.agendaService.listarPorMes(ano, mes).subscribe({
      next: (eventos) => {
        this.eventosAgenda = eventos;
        this.gerarCalendario(); /* Regenera o calendário com os eventos */
      },
      error: () => { /* Sem eventos no mês */ }
    });
  }

  // ============================================================
  // NAVEGAÇÃO DA SIDEBAR
  // ============================================================

  /** Navega para uma seção e atualiza o título da topbar */
  navegarPara(id: string): void {
    this.secaoAtiva = id;
    const item = this.menuItems.find(m => m.id === id);
    this.tituloSecao = item?.nome || 'Painel';

    /* Ao entrar no dashboard, redesenha os gráficos */
    if (id === 'dashboard') {
      setTimeout(() => this.desenharGraficos(), 100);
    }
  }

  /** Alterna o estado aberto/fechado da sidebar */
  alternarSidebar(): void {
    this.sidebarFechada = !this.sidebarFechada;
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  /** Realiza logout e redireciona para a página de login */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ============================================================
  // CALENDÁRIO
  // ============================================================

  /** Gera os dias do mês para o grid do calendário */
  gerarCalendario(): void {
    const ano = this.dataCalendario.getFullYear();
    const mes = this.dataCalendario.getMonth();
    const hoje = new Date();

    this.mesAtualLabel = `${this.meses[mes]}`;

    /* Primeiro e último dia do mês */
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    this.diasDoMes = [];

    /* Dias do mês anterior para preencher a primeira semana */
    const diaSemanaInicio = primeiroDia.getDay(); // 0=domingo
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const d = new Date(ano, mes, -i);
      this.diasDoMes.push({ numero: d.getDate(), data: this.formatarData(d), hoje: false, mesAtual: false, temEvento: false });
    }

    /* Dias do mês atual */
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const data = new Date(ano, mes, d);
      const dataStr = this.formatarData(data);
      const evento = this.eventosAgenda.find(e => e.dataInicio.startsWith(dataStr));

      this.diasDoMes.push({
        numero: d,
        data: dataStr,
        hoje: data.toDateString() === hoje.toDateString(),
        mesAtual: true,
        temEvento: !!evento,
        evento: evento
      });
    }

    /* Dias do mês seguinte para completar a última semana */
    const totalCelulas = Math.ceil(this.diasDoMes.length / 7) * 7;
    let dProx = 1;
    while (this.diasDoMes.length < totalCelulas) {
      const d = new Date(ano, mes + 1, dProx++);
      this.diasDoMes.push({ numero: d.getDate(), data: this.formatarData(d), hoje: false, mesAtual: false, temEvento: false });
    }
  }

  /** Navega para o mês anterior no calendário */
  mesAnterior(): void {
    this.dataCalendario = new Date(this.dataCalendario.getFullYear(), this.dataCalendario.getMonth() - 1, 1);
    this.carregarEventosAgenda();
  }

  /** Navega para o próximo mês no calendário */
  proximoMes(): void {
    this.dataCalendario = new Date(this.dataCalendario.getFullYear(), this.dataCalendario.getMonth() + 1, 1);
    this.carregarEventosAgenda();
  }

  /** Exibe os eventos de um dia específico */
  verEventosDia(data: string): void {
    const eventos = this.eventosAgenda.filter(e => e.dataInicio.startsWith(data));
    const nomes = eventos.map(e => `• ${e.titulo}`).join('\n');
    alert(`Eventos em ${data}:\n\n${nomes}`);
  }

  /** Abre o Google Calendar em nova aba */
  abrirGoogleCalendar(): void {
    window.open('https://calendar.google.com', '_blank');
  }

  /** Formata Date para YYYY-MM-DD */
  private formatarData(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  // ============================================================
  // PEDIDOS
  // ============================================================

  /** Filtra a tabela de pedidos por texto e status */
  filtrarPedidos(): void {
    this.pedidosFiltrados = this.todosPedidos.filter(p => {
      const matchBusca = !this.termoBusca ||
        p.nomeCliente.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
        p.tipoEvento.toLowerCase().includes(this.termoBusca.toLowerCase());
      const matchStatus = !this.filtroStatus || p.status === this.filtroStatus;
      return matchBusca && matchStatus;
    });
  }

  /** Exibe detalhes de um pedido (modal ou alerta simplificado) */
  abrirPedido(pedido: Pedido): void {
    alert(`Pedido #${pedido.id}\nCliente: ${pedido.nomeCliente}\nEvento: ${pedido.tipoEvento}\nData: ${pedido.dataEvento}\nTotal: R$ ${pedido.valorTotal}`);
  }

  /** Aprova um pedido — atualiza status no Spring Boot */
  aprovarPedido(pedido: Pedido): void {
    this.mudarStatus(pedido, 'aprovado');
  }

  /**
   * Muda o status de um pedido via Spring Boot.
   * PUT /api/orcamentos/:id/status
   */
  mudarStatus(pedido: Pedido, novoStatus: string): void {
    this.orcamentoService.atualizarStatus(pedido.id!, novoStatus).subscribe({
      next: () => {
        pedido.status = novoStatus;
        this.filtrarPedidos();
      },
      error: () => alert('Erro ao atualizar status.')
    });
  }

  /** Traduz status para português */
  traduzirStatus(status: string): string {
    const mapa: Record<string, string> = {
      novo: 'Novo', em_analise: 'Em Análise',
      aprovado: 'Aprovado', cancelado: 'Cancelado', pendente: 'Pendente'
    };
    return mapa[status] || status;
  }

  // ============================================================
  // CADASTRO DE ITENS DO CATÁLOGO
  // ============================================================

  /** Verifica se campo do formulário de cadastro está inválido */
  campoInvalido(form: FormGroup, campo: string): boolean {
    const c = form.get(campo);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  /** Captura a imagem selecionada pelo usuário e gera preview */
  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imagemArquivo = input.files[0];
      this.nomeArquivo = input.files[0].name;

      /* FileReader gera uma URL de objeto para preview sem upload */
      const reader = new FileReader();
      reader.onload = (e) => { this.previewImagem = e.target?.result as string; };
      reader.readAsDataURL(input.files[0]);
    }
  }

  /**
   * Salva o item no catálogo via Spring Boot.
   * Cria novo (POST) ou atualiza existente (PUT) conforme editandoItem.
   */
  salvarItem(): void {
    if (this.cadastroForm.invalid) { this.cadastroForm.markAllAsTouched(); return; }

    this.salvando = true;
    const item: Catalogo = {
      ...this.cadastroForm.value,
      imagemUrl: this.previewImagem || 'https://via.placeholder.com/400x300?text=Sem+Imagem'
    };

    const operacao = this.editandoItem
      ? this.cataloService.atualizar(this.idEditando!, item, this.imagemArquivo || undefined)
      : this.cataloService.criar(item, this.imagemArquivo || undefined);

    operacao.subscribe({
      next: (salvo) => {
        if (this.editandoItem) {
          const idx = this.itensCatalogo.findIndex(i => i.id === this.idEditando);
          if (idx !== -1) this.itensCatalogo[idx] = salvo;
        } else {
          this.itensCatalogo.unshift(salvo);
        }
        this.salvando = false;
        this.cancelarEdicao();
      },
      error: () => { this.salvando = false; alert('Erro ao salvar item.'); }
    });
  }

  /** Preenche o formulário para edição de um item existente */
  editarItem(item: Catalogo): void {
    this.editandoItem = true;
    this.idEditando = item.id!;
    this.previewImagem = item.imagemUrl;
    this.cadastroForm.patchValue({ ...item });
    /* Scrolla para o topo do formulário */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Cancela a edição e reseta o formulário */
  cancelarEdicao(): void {
    this.editandoItem = false;
    this.idEditando = null;
    this.previewImagem = null;
    this.nomeArquivo = '';
    this.imagemArquivo = null;
    this.cadastroForm.reset({ obrigatorio: false, ativo: true, preco: 0 });
  }

  /**
   * Remove um item do catálogo via Spring Boot.
   * DELETE /api/catalogo/:id
   */
  excluirItem(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    this.cataloService.remover(id).subscribe({
      next: () => { this.itensCatalogo = this.itensCatalogo.filter(i => i.id !== id); },
      error: () => alert('Erro ao excluir item.')
    });
  }

  // ============================================================
  // GRÁFICOS — Canvas API (sem dependência externa)
  // ============================================================

  /** Desenha o gráfico de barras e o donut no canvas */
  desenharGraficos(): void {
    this.desenharBarras();
    this.desenharDonut();
  }

  /** Desenha gráfico de barras de faturamento mensal com Canvas API */
  private desenharBarras(): void {
    if (!this.graficoBarra?.nativeElement) return;
    const canvas = this.graficoBarra.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* Dados de exemplo — substituir pelos dados reais do Spring Boot */
    const dados = [12000, 18500, 9800, 23000, 16700, 28900, 21000, 19500, 25000, 31000, 17500, 22000];
    const labelsMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;
    const maxVal = Math.max(...dados);
    const barW = (chartW / dados.length) * 0.6;
    const barGap = chartW / dados.length;

    ctx.clearRect(0, 0, W, H);

    /* Linhas horizontais guia */
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(W - padding.right, y); ctx.stroke();
    }

    /* Barras */
    dados.forEach((val, i) => {
      const barH = (val / maxVal) * chartH;
      const x = padding.left + i * barGap + (barGap - barW) / 2;
      const y = padding.top + chartH - barH;

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, y, barW, barH);

      /* Label do mês */
      ctx.fillStyle = '#888888';
      ctx.font = '11px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labelsMeses[i], x + barW / 2, H - 10);
    });
  }

  /** Desenha gráfico donut de tipos de evento com Canvas API */
  private desenharDonut(): void {
    if (!this.graficoDonut?.nativeElement) return;
    const canvas = this.graficoDonut.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = 200;
    const H = canvas.height = 200;
    const cx = W / 2, cy = H / 2;
    const raioExterno = 80, raioInterno = 50;

    const dados = this.legendaDonut;
    const total = dados.reduce((s, d) => s + d.valor, 0);
    let anguloInicio = -Math.PI / 2;

    ctx.clearRect(0, 0, W, H);

    dados.forEach(seg => {
      const angulo = (seg.valor / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, raioExterno, anguloInicio, anguloInicio + angulo);
      ctx.arc(cx, cy, raioInterno, anguloInicio + angulo, anguloInicio, true);
      ctx.closePath();
      ctx.fillStyle = seg.cor;
      ctx.fill();
      anguloInicio += angulo;
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /** Atualiza os KPIs com base nos pedidos carregados */
  private atualizarKpis(pedidos: Pedido[]): void {
    const faturamento = pedidos.filter(p => p.status === 'aprovado').reduce((s, p) => s + p.valorTotal, 0);
    const pendentes = pedidos.filter(p => p.status === 'novo' || p.status === 'em_analise').length;
    const confirmados = pedidos.filter(p => p.status === 'aprovado').length;

    this.kpis[0].valor = `R$ ${(faturamento / 1000).toFixed(0)}k`;
    this.kpis[1].valor = String(pedidos.length);
    this.kpis[2].valor = String(confirmados);
    this.kpis[3].valor = String(pendentes);
  }

  /** Dados de exemplo para desenvolvimento sem backend */
  private carregarDadosExemploPedidos(): void {
    this.todosPedidos = [
      { id:1, orcamentoId:1, nomeCliente:'Ana Carolina Silva', emailCliente:'ana@email.com', telefoneCliente:'(21)99999-0001', tipoEvento:'casamento', dataEvento:'2025-10-15', numeroConvidados:200, valorTotal:32000, status:'novo' },
      { id:2, orcamentoId:2, nomeCliente:'Marcos Oliveira',     emailCliente:'marcos@email.com', telefoneCliente:'(21)99999-0002', tipoEvento:'debutante', dataEvento:'2025-11-20', numeroConvidados:150, valorTotal:18500, status:'em_analise' },
      { id:3, orcamentoId:3, nomeCliente:'Fernanda Santos',     emailCliente:'fernanda@email.com', telefoneCliente:'(21)99999-0003', tipoEvento:'infantil', dataEvento:'2025-09-28', numeroConvidados:80, valorTotal:9800, status:'aprovado' }
    ];
    this.pedidosRecentes = this.todosPedidos.slice(0, 5);
    this.pedidosFiltrados = [...this.todosPedidos];
    this.totalPendentes = 2;
    this.atualizarKpis(this.todosPedidos);
  }
}
