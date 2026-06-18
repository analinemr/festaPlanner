/**
 * COMPONENTE: Agenda
 *
 * Calendário completo de eventos do painel administrativo.
 * Exibe eventos por mês, permite criar, editar e excluir eventos.
 * Integra com o Google Calendar via link externo.
 *
 * Integração Spring Boot:
 *  - AgendaService → /api/agendas/mes/:ano/:mes
 *  - AgendaService → /api/agendas/disponibilidade/:data
 *  - AgendaService → POST/PUT/DELETE /api/agendas
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AgendaService } from '../../core/services/agenda-service';
import { AuthService } from '../../core/services/auth-service';
import { Agenda } from '../../models/agenda';

/** Dia do calendário com lista de eventos */
interface DiaCalendario {
  numero:   number;
  data:     string;       // YYYY-MM-DD
  hoje:     boolean;
  mesAtual: boolean;
  eventos:  Agenda[];
}

@Component({
  selector: 'app-agenda',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe, SlicePipe],
  templateUrl: './agenda-component.html',
  styleUrl: './agenda-component.css'
})
export class AgendaComponent implements OnInit {

  // ============================================================
  // CALENDÁRIO
  // ============================================================

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  dataCalendario = new Date();
  mesAtualLabel = '';
  anoAtual = new Date().getFullYear();
  diasDoMes: DiaCalendario[] = [];

  /** Dia selecionado no grid (formato YYYY-MM-DD) */
  diaSelecionado = '';

  /** Label legível do dia selecionado */
  diaSelecionadoLabel = 'Selecione um dia';

  // ============================================================
  // EVENTOS
  // ============================================================

  /** Todos os eventos do mês carregados do Spring Boot */
  eventosDoMes: Agenda[] = [];

  /** Eventos do dia atualmente selecionado */
  eventosDiaSelecionado: Agenda[] = [];

  /** Evento clicado para exibir detalhes */
  eventoSelecionado: Agenda | null = null;

  carregando = false;
  carregandoEventosDia = false;

  // ============================================================
  // FORMULÁRIO DE EVENTO
  // ============================================================

  eventoForm!: FormGroup;
  exibirFormEvento = false;
  eventoEditando: Agenda | null = null;
  salvandoEvento = false;

  /** Paleta de cores para o seletor visual */
  coresPaleta = ['#444444','#888888','#c0c0c0','#1a1a1a','#8B4513','#2E8B57','#4682B4','#8B008B'];

  /** Legenda de cores do calendário */
  legendaCores = [
    { cor: '#444444', label: 'Casamento' },
    { cor: '#2E8B57', label: 'Aniversário' },
    { cor: '#4682B4', label: 'Corporativo' },
    { cor: '#8B4513', label: 'Outro' }
  ];

  // ============================================================
  // SIDEBAR
  // ============================================================
  sidebarFechada = false;

  constructor(
    private agendaService: AgendaService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarMes();
    this.selecionarDiaHoje();
  }

  // ============================================================
  // CALENDÁRIO
  // ============================================================

  /** Carrega eventos do mês e gera o grid do calendário */
  carregarMes(): void {
    const ano = this.dataCalendario.getFullYear();
    const mes = this.dataCalendario.getMonth();
    this.mesAtualLabel = this.meses[mes];
    this.anoAtual = ano;
    this.carregando = true;

    this.agendaService.listarPorMes(ano, mes + 1).subscribe({
      next: (eventos) => {
        this.eventosDoMes = eventos;
        this.gerarGridCalendario(ano, mes, eventos);
        this.carregando = false;
        /* Atualiza os eventos do dia selecionado com os novos dados */
        if (this.diaSelecionado) {
          this.eventosDiaSelecionado = eventos.filter(e => e.dataInicio.startsWith(this.diaSelecionado));
        }
      },
      error: () => {
        this.gerarGridCalendario(ano, mes, []);
        this.carregando = false;
      }
    });
  }

  /**
   * Gera o array de dias para o grid do calendário.
   * Inclui dias do mês anterior e seguinte para completar as semanas.
   */
  gerarGridCalendario(ano: number, mes: number, eventos: Agenda[]): void {
    const hoje = new Date();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    this.diasDoMes = [];

    /* Dias do mês anterior para completar a primeira semana */
    for (let i = primeiroDia.getDay() - 1; i >= 0; i--) {
      const d = new Date(ano, mes, -i);
      this.diasDoMes.push(this.criarDia(d, false, eventos));
    }

    /* Dias do mês atual */
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      this.diasDoMes.push(this.criarDia(new Date(ano, mes, d), true, eventos));
    }

    /* Dias do mês seguinte */
    let prox = 1;
    const totalCelulas = Math.ceil(this.diasDoMes.length / 7) * 7;
    while (this.diasDoMes.length < totalCelulas) {
      this.diasDoMes.push(this.criarDia(new Date(ano, mes + 1, prox++), false, eventos));
    }
  }

  /** Cria um objeto DiaCalendario para o grid */
  criarDia(data: Date, mesAtual: boolean, eventos: Agenda[]): DiaCalendario {
    const dataStr = this.formatarData(data);
    return {
      numero:   data.getDate(),
      data:     dataStr,
      hoje:     data.toDateString() === new Date().toDateString(),
      mesAtual,
      eventos:  eventos.filter(e => e.dataInicio.startsWith(dataStr))
    };
  }

  /** Seleciona um dia e carrega seus eventos */
  selecionarDia(dia: DiaCalendario): void {
    this.diaSelecionado = dia.data;
    this.eventosDiaSelecionado = dia.eventos;
    this.eventoSelecionado = null;
    this.exibirFormEvento = false;

    /* Formata o label do dia selecionado */
    const [ano, mes, d] = dia.data.split('-').map(Number);
    this.diaSelecionadoLabel = `${d} de ${this.meses[mes - 1]} de ${ano}`;

    /* Pré-preenche a data no formulário de novo evento */
    if (this.eventoForm) {
      this.eventoForm.patchValue({
        dataInicio: `${dia.data}T09:00`,
        dataFim:    `${dia.data}T18:00`
      });
    }
  }

  /** Seleciona o dia de hoje ao inicializar */
  selecionarDiaHoje(): void {
    const hoje = new Date();
    const diaHoje = this.diasDoMes.find(d => d.hoje);
    if (diaHoje) {
      this.selecionarDia(diaHoje);
    } else {
      /* Se ainda não gerou o grid, usa a data atual diretamente */
      this.diaSelecionado = this.formatarData(hoje);
      this.diaSelecionadoLabel = `${hoje.getDate()} de ${this.meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
    }
  }

  mesAnterior(): void {
    this.dataCalendario = new Date(this.dataCalendario.getFullYear(), this.dataCalendario.getMonth() - 1, 1);
    this.carregarMes();
  }

  proximoMes(): void {
    this.dataCalendario = new Date(this.dataCalendario.getFullYear(), this.dataCalendario.getMonth() + 1, 1);
    this.carregarMes();
  }

  // ============================================================
  // EVENTOS
  // ============================================================

  /** Seleciona um evento para ver detalhes */
  selecionarEvento(evento: Agenda): void {
    this.eventoSelecionado = evento;
  }

  /** Traduz status para exibição */
  traduzirStatus(status: string): string {
    const mapa: Record<string, string> = { confirmado: 'Confirmado', pendente: 'Pendente', cancelado: 'Cancelado' };
    return mapa[status] || status;
  }

  abrirGoogleCalendar(): void {
    window.open('https://calendar.google.com', '_blank');
  }

  // ============================================================
  // FORMULÁRIO DE EVENTO
  // ============================================================

  inicializarFormulario(): void {
    this.eventoForm = this.fb.group({
      titulo:      ['', Validators.required],
      dataInicio:  ['', Validators.required],
      dataFim:     ['', Validators.required],
      nomeCliente: [''],
      tipoEvento:  [''],
      cor:         ['#444444'],
      status:      ['pendente'],
      observacoes: ['']
    });
  }

  abrirFormNovoEvento(): void {
    this.eventoEditando = null;
    this.eventoForm.reset({ cor: '#444444', status: 'pendente' });
    if (this.diaSelecionado) {
      this.eventoForm.patchValue({
        dataInicio: `${this.diaSelecionado}T09:00`,
        dataFim:    `${this.diaSelecionado}T18:00`
      });
    }
    this.exibirFormEvento = true;
  }

  editarEvento(evento: Agenda): void {
    this.eventoEditando = evento;
    this.eventoForm.patchValue({
      titulo:      evento.titulo,
      dataInicio:  evento.dataInicio.slice(0, 16), // Remove segundos para datetime-local
      dataFim:     evento.dataFim.slice(0, 16),
      nomeCliente: evento.nomeCliente,
      tipoEvento:  evento.tipoEvento,
      cor:         evento.cor,
      status:      evento.status,
      observacoes: evento.observacoes
    });
    this.exibirFormEvento = true;
  }

  fecharFormEvento(): void {
    this.exibirFormEvento = false;
    this.eventoEditando = null;
  }

  /**
   * Salva (cria ou atualiza) um evento via Spring Boot.
   * POST /api/agendas ou PUT /api/agendas/:id
   */
  salvarEvento(): void {
    if (this.eventoForm.invalid) { this.eventoForm.markAllAsTouched(); return; }
    this.salvandoEvento = true;

    const dados: Agenda = { ...this.eventoForm.value };
    const operacao = this.eventoEditando
      ? this.agendaService.atualizar(this.eventoEditando.id!, dados)
      : this.agendaService.criar(dados);

    operacao.subscribe({
      next: () => {
        this.salvandoEvento = false;
        this.fecharFormEvento();
        this.carregarMes(); /* Recarrega para refletir o novo evento */
      },
      error: () => {
        this.salvandoEvento = false;
        alert('Erro ao salvar evento.');
      }
    });
  }

  confirmarExclusao(evento: Agenda): void {
    if (!confirm(`Excluir o evento "${evento.titulo}"?`)) return;
    this.agendaService.remover(evento.id!).subscribe({
      next: () => this.carregarMes(),
      error: () => alert('Erro ao excluir evento.')
    });
  }

  // ============================================================
  // SIDEBAR / AUTH
  // ============================================================
  alternarSidebar(): void { this.sidebarFechada = !this.sidebarFechada; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatarData(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
