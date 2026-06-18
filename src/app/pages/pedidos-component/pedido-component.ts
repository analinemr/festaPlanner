/**
 * COMPONENTE: Pedidos
 *
 * Página standalone de gerenciamento de pedidos/orçamentos.
 * Exibe tabela completa com filtros avançados, ordenação e modal de detalhe.
 * Permite aprovar, cancelar e visualizar cada pedido individualmente.
 *
 * Integração Spring Boot: PedidosService → /api/pedidos
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../core/services/pedidos-service';
import { AuthService } from '../../core/services/auth-service';
import { Pedido } from '../../models/pedidos';

/** Card de status rápido exibido acima da tabela */
interface CardStatus {
  status: string;
  label:  string;
  icone:  string;
  quantidade: number;
}

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe, TitleCasePipe, DatePipe],
  templateUrl: './pedido-component.html',
  styleUrl: './pedido-component.css'
})
export class PedidosComponent implements OnInit {

  // ============================================================
  // DADOS
  // ============================================================

  todosPedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  carregando = false;

  // ============================================================
  // FILTROS
  // ============================================================

  termoBusca = '';
  filtroStatus = '';
  dataInicio = '';
  dataFim = '';

  get temFiltroAtivo(): boolean {
    return !!(this.termoBusca || this.filtroStatus || this.dataInicio || this.dataFim);
  }

  // ============================================================
  // ORDENAÇÃO
  // ============================================================

  campoOrdenacao: keyof Pedido = 'id';
  ordemCrescente = false; // Padrão: mais recentes primeiro

  // ============================================================
  // CARDS DE STATUS
  // ============================================================

  cardsStatus: CardStatus[] = [
    { status: 'novo',       label: 'Novos',         icone: '🆕', quantidade: 0 },
    { status: 'em_analise', label: 'Em Análise',     icone: '🔍', quantidade: 0 },
    { status: 'aprovado',   label: 'Aprovados',      icone: '✅', quantidade: 0 },
    { status: 'cancelado',  label: 'Cancelados',     icone: '❌', quantidade: 0 }
  ];

  get totalNovos(): number {
    return this.cardsStatus.find(c => c.status === 'novo')?.quantidade || 0;
  }

  // ============================================================
  // MODAL DE DETALHE
  // ============================================================

  pedidoDetalhe: Pedido | null = null;

  // ============================================================
  // SIDEBAR
  // ============================================================

  sidebarFechada = false;

  constructor(
    private pedidosService: PedidosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  // ============================================================
  // CARREGAMENTO
  // ============================================================

  carregarPedidos(): void {
    this.carregando = true;
    this.pedidosService.listarTodos().subscribe({
      next: (pedidos) => {
        this.todosPedidos = pedidos;
        this.atualizarCardsStatus(pedidos);
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: () => { this.carregando = false; }
    });
  }

  /** Atualiza as quantidades nos cards de status */
  atualizarCardsStatus(pedidos: Pedido[]): void {
    this.cardsStatus.forEach(card => {
      card.quantidade = pedidos.filter(p => p.status === card.status).length;
    });
  }

  // ============================================================
  // FILTROS
  // ============================================================

  filtrarPorStatus(status: string): void {
    /* Toggle: clica no mesmo status → limpa filtro */
    this.filtroStatus = this.filtroStatus === status ? '' : status;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = [...this.todosPedidos];

    /* Filtro de status */
    if (this.filtroStatus) {
      resultado = resultado.filter(p => p.status === this.filtroStatus);
    }

    /* Filtro de busca por texto */
    if (this.termoBusca.trim()) {
      const busca = this.termoBusca.toLowerCase();
      resultado = resultado.filter(p =>
        p.nomeCliente.toLowerCase().includes(busca) ||
        p.emailCliente.toLowerCase().includes(busca) ||
        p.tipoEvento.toLowerCase().includes(busca)
      );
    }

    /* Filtro por intervalo de datas */
    if (this.dataInicio) {
      resultado = resultado.filter(p => p.dataEvento >= this.dataInicio);
    }
    if (this.dataFim) {
      resultado = resultado.filter(p => p.dataEvento <= this.dataFim);
    }

    /* Aplica ordenação */
    this.pedidosFiltrados = this.ordenar(resultado);
  }

  limparFiltros(): void {
    this.termoBusca = '';
    this.filtroStatus = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.aplicarFiltros();
  }

  // ============================================================
  // ORDENAÇÃO
  // ============================================================

  ordenarPor(campo: keyof Pedido): void {
    if (this.campoOrdenacao === campo) {
      this.ordemCrescente = !this.ordemCrescente;
    } else {
      this.campoOrdenacao = campo;
      this.ordemCrescente = true;
    }
    this.pedidosFiltrados = this.ordenar(this.pedidosFiltrados);
  }

  private ordenar(lista: Pedido[]): Pedido[] {
    return [...lista].sort((a, b) => {
      const va = a[this.campoOrdenacao] ?? '';
      const vb = b[this.campoOrdenacao] ?? '';
      const comparacao = String(va).localeCompare(String(vb), 'pt-BR', { numeric: true });
      return this.ordemCrescente ? comparacao : -comparacao;
    });
  }

  iconOrdenacao(campo: string): string {
    if (this.campoOrdenacao !== campo) return '⇅';
    return this.ordemCrescente ? '↑' : '↓';
  }

  // ============================================================
  // AÇÕES NOS PEDIDOS
  // ============================================================

  /** Atualiza o status de um pedido via Spring Boot */
    mudarStatus(pedido: Pedido, novoStatus: string): void {
      const confirmacoes: Record<string, string> = {
        aprovado: `Aprovar o pedido de ${pedido.nomeCliente}?`,
        cancelado: `Cancelar o pedido de ${pedido.nomeCliente}?`,
        em_analise: ''
      };

      if (confirmacoes[novoStatus] && !confirm(confirmacoes[novoStatus])) {
        return;
      }

      this.pedidosService.atualizarStatus(pedido.id!, novoStatus).subscribe({
        next: () => {
          /* Atualiza localmente sem recarregar a lista inteira */
          pedido.status = novoStatus;

          this.atualizarCardsStatus(this.todosPedidos);
          this.aplicarFiltros();

          /* Atualiza o modal se estiver aberto */
          if (this.pedidoDetalhe && this.pedidoDetalhe.id === pedido.id) {
            this.pedidoDetalhe.status = novoStatus;
          }
        },
        error: () => {
          alert('Erro ao atualizar o status.');
        }
      });
    }

  // ============================================================
  // MODAL DE DETALHE
  // ============================================================

  abrirDetalhe(pedido: Pedido): void {
    this.pedidoDetalhe = pedido;
    document.body.style.overflow = 'hidden';
  }

  fecharDetalhe(): void {
    this.pedidoDetalhe = null;
    document.body.style.overflow = '';
  }

  // ============================================================
  // HELPERS
  // ============================================================

  traduzirStatus(status: string): string {
    return this.pedidosService.traduzirStatus(status);
  }

  /**
   * Gera um link direto para o WhatsApp do cliente.
   * Abre uma conversa com mensagem pré-preenchida.
   */
  gerarLinkWhatsApp(pedido: Pedido): string {
    const telefone = pedido.telefoneCliente?.replace(/\D/g, '') || '';
    const mensagem = encodeURIComponent(
      `Olá, ${pedido.nomeCliente}! 👋\n` +
      `Entramos em contato sobre seu pedido de ${pedido.tipoEvento} para o dia ${pedido.dataEvento}.\n` +
      `Podemos conversar sobre os detalhes?`
    );
    return `https://wa.me/55${telefone}?text=${mensagem}`;
  }

  // ============================================================
  // SIDEBAR / AUTH
  // ============================================================

  alternarSidebar(): void { this.sidebarFechada = !this.sidebarFechada; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
