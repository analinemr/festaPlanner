import {
  Component, OnInit, AfterViewInit,
  ViewChild, ElementRef, ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

interface Pedido {
  num: string; client: string; event: string; date: string;
  guests: number; value: number; status: string;
}

interface Produto {
  name: string; cat: string; catLabel: string;
  desc: string; price: number; required: boolean; img: string;
}

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit, AfterViewInit {

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  // ---- ESTADO GERAL ----
  painelAtivo  = 'dashboard';
  tituloPainel = 'Painel';
  dataAtual    = '';
  anoAtual     = new Date().getFullYear();
  termoBusca   = '';
  nomeUsuario  = 'Administrador';
  inicialUsuario = 'A';

  bgUrl(url: string): string { return `url('${url}')`; }

  // ---- KPIs ----
  kpis = [
    { cor:'green',  valor:'12',        label:'Novos Pedidos' },
    { cor:'yellow', valor:'5',         label:'Em Negociação' },
    { cor:'blue',   valor:'R$ 94.800', label:'Receita do Mês' },
    { cor:'silver', valor:'8',         label:'Eventos Confirmados' }
  ];

  // ---- PEDIDOS ----
  allOrders: Pedido[] = [
    { num:'12345', client:'Aniversário Lucca',  event:'Infantil',  date:'15/10/2026', guests:100, value:4500,  status:'Pendente' },
    { num:'12346', client:'Casamento Carla',    event:'Casamento', date:'01/12/2026', guests:250, value:12000, status:'Pré-Reserva' },
    { num:'12347', client:'Carndo Silver',      event:'Temático',  date:'20/11/2026', guests:80,  value:6800,  status:'Novo' },
    { num:'12348', client:'Debutante Sofia',    event:'15 Anos',   date:'05/11/2026', guests:120, value:8200,  status:'Confirmado' },
    { num:'12349', client:'Rebeca & Paulo',     event:'Casamento', date:'10/01/2027', guests:180, value:15400, status:'Novo' },
    { num:'12350', client:'Aniversário Theo',   event:'Infantil',  date:'22/10/2026', guests:60,  value:3200,  status:'Confirmado' }
  ];
  pedidosFiltrados: Pedido[] = [];
  get pedidosRecentes(): Pedido[] { return this.allOrders.slice(0, 3); }
  get totalNovos(): number { return this.allOrders.filter(p => p.status === 'Novo' || p.status === 'Pendente').length; }

  // ---- MODAL ----
  modalAberto = false;
  pedidoModal: Pedido | null = null;

  // ---- CALENDÁRIO ----
  diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  calYear = 2026; calMonth = 9;

  get mesLabel(): string { return `${this.meses[this.calMonth]} ${this.calYear}`; }

  private EVENTS: Record<number,string> = {
    2:'confirmed', 3:'confirmed', 8:'prereserva',
    10:'prereserva', 12:'confirmed', 22:'confirmed', 23:'confirmed', 26:'prereserva'
  };

  cellsMini:   { num: string; cls: string }[] = [];
  cellsGrande: { num: string; cls: string; evento?: string }[] = [];

  proximosEventos = [
    { day:'02', mon:'OUT', name:'Casamento Renata & Carlos', info:'Casamento · 200 conv.', cls:'confirmed' },
    { day:'08', mon:'OUT', name:'Aniversário Lucca',         info:'Infantil · 100 conv.',  cls:'prereserva' },
    { day:'12', mon:'OUT', name:'Casamento Carla',           info:'Casamento · 250 conv.', cls:'confirmed' },
    { day:'22', mon:'OUT', name:'Debutante Sofia',           info:'15 Anos · 120 conv.',   cls:'confirmed' }
  ];

  // ---- GRÁFICOS ----
  chartData: { m: string; v: number; pct: number }[] = [];

  donutData = [
    { label:'Casamento', val:35, color:'#2D2D2D' },
    { label:'15 Anos',   val:28, color:'#C9A96E' },
    { label:'Infantil',  val:22, color:'#9CA3AF' },
    { label:'Temático',  val:15, color:'#E5E7EB' }
  ];

  barReport = [
    { label:'Casamento', val:'R$ 99k', pct:100, color:'#2D2D2D' },
    { label:'15 Anos',   val:'R$ 79k', pct:80,  color:'#C9A96E' },
    { label:'Infantil',  val:'R$ 62k', pct:63,  color:'#9CA3AF' },
    { label:'Temático',  val:'R$ 42k', pct:43,  color:'#E5E7EB' }
  ];

  // ---- CATÁLOGO ----
  filtrosCat = [
    { val:'all', label:'Todos' }, { val:'buffet', label:'Buffet' },
    { val:'bolo', label:'Bolo' }, { val:'decor', label:'Decoração' }, { val:'musica', label:'Música' }
  ];
  filtroCatAtivo = 'all';

  allProducts: Produto[] = [
    { name:'Buffet Básico',    cat:'buffet', catLabel:'Buffet',     desc:'Salgados, frios e pratos quentes', price:2500, required:true,  img:'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80' },
    { name:'Buffet Premium',   cat:'buffet', catLabel:'Buffet',     desc:'Gourmet com estações ao vivo',     price:4200, required:false, img:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80' },
    { name:'Bolo 3 Andares',   cat:'bolo',   catLabel:'Bolo',       desc:'Pasta americana.',                 price:1200, required:false, img:'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&q=80' },
    { name:'Mesa de Doces',    cat:'bolo',   catLabel:'Bolo',       desc:'Brigadeiros, trufas e bem-casados',price:680,  required:false, img:'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80' },
    { name:'Decoração Floral', cat:'decor',  catLabel:'Decoração',  desc:'Arranjos completos.',               price:4800, required:true,  img:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=400&q=80' },
    { name:'DJ Profissional',  cat:'musica', catLabel:'Música',     desc:'6 horas de música.',               price:800,  required:false, img:'https://images.unsplash.com/photo-1571266752461-eff34b1f01cd?w=400&q=80' }
  ];
  produtosFiltrados: Produto[] = [];

  // ---- CADASTRO ----
  novoProd = { nome:'', categoria:'Buffet', preco:0, tipo:'opcional', desc:'' };
  prodSalvo = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Data
    const d = new Date();
    this.dataAtual = d.toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

    // Usuário
    const u = this.authService.getUsuario();
    if (u?.nome) { this.nomeUsuario = u.nome; this.inicialUsuario = u.nome[0].toUpperCase(); }

    // Init dados
    this.pedidosFiltrados = [...this.allOrders];
    this.produtosFiltrados = [...this.allProducts];
    this.gerarCalendario();
    this.gerarGrafico();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.desenharDonut(), 200);
  }

  // ---- NAVEGAÇÃO ----
  showPanel(id: string): void {
    this.painelAtivo = id;
    const titulos: Record<string, string> = {
      dashboard:'Painel', pedidos:'Pedidos', agenda:'Agenda',
      catalogo:'Catálogo', cadastro:'Novo Produto',
      relatorios:'Relatórios', configuracoes:'Configurações'
    };
    this.tituloPainel = titulos[id] || id;
    if (id === 'dashboard') setTimeout(() => this.desenharDonut(), 100);
    if (id === 'agenda')    this.gerarCalendarioGrande();
  }

  // ---- PEDIDOS ----
  statusClass(s: string): string {
    const m: Record<string,string> = {
      'Novo':'new', 'Pendente':'pending', 'Pré-Reserva':'prereserva',
      'Confirmado':'confirmed', 'Rejeitado':'rejected'
    };
    return m[s] || 'pending';
  }

  changeStatus(p: Pedido, status: string): void { p.status = status; }

  filtrarPorStatus(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.pedidosFiltrados = v ? this.allOrders.filter(p => p.status === v) : [...this.allOrders];
  }

  filtrarPedidos(): void {
    const q = this.termoBusca.toLowerCase();
    this.pedidosFiltrados = q
      ? this.allOrders.filter(p => p.client.toLowerCase().includes(q) || p.event.toLowerCase().includes(q))
      : [...this.allOrders];
  }

  openModal(p: Pedido): void { this.pedidoModal = p; this.modalAberto = true; }
  fecharModal(): void { this.modalAberto = false; this.pedidoModal = null; }

  // ---- CALENDÁRIO ----
  gerarCalendario(): void {
    const today = new Date();
    const first = new Date(this.calYear, this.calMonth, 1).getDay();
    const total = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    this.cellsMini = [];
    for (let i = 0; i < first; i++) this.cellsMini.push({ num:'', cls:'empty' });
    for (let d = 1; d <= total; d++) {
      const isToday = d === today.getDate() && this.calMonth === today.getMonth() && this.calYear === today.getFullYear();
      const evCls = this.EVENTS[d] || '';
      this.cellsMini.push({ num: String(d), cls: [evCls, isToday ? 'today' : ''].join(' ').trim() });
    }
  }

  gerarCalendarioGrande(): void {
    const today = new Date();
    const first = new Date(2026, 9, 1).getDay();
    this.cellsGrande = [];
    for (let i = 0; i < first; i++) this.cellsGrande.push({ num:'', cls:'empty' });
    for (let d = 1; d <= 31; d++) {
      const evCls = this.EVENTS[d] || '';
      const isToday = d === today.getDate() && today.getMonth() === 9 && today.getFullYear() === 2026 ? 'today' : '';
      const evento = evCls === 'confirmed' ? '● Confirmado' : evCls === 'prereserva' ? '● Pré-Reserva' : undefined;
      this.cellsGrande.push({ num: String(d), cls: [evCls, isToday].join(' ').trim(), evento });
    }
  }

  changeMonth(dir: number): void {
    this.calMonth += dir;
    if (this.calMonth > 11) { this.calMonth = 0; this.calYear++; }
    if (this.calMonth < 0)  { this.calMonth = 11; this.calYear--; }
    this.gerarCalendario();
  }

  // ---- GRÁFICO DE BARRAS ----
  gerarGrafico(): void {
    const dados = [9200,11400,8700,14200,12800,15600,13900,16200,11700,15800,0,0];
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const max = Math.max(...dados);
    this.chartData = dados.map((v, i) => ({ m: meses[i], v, pct: v ? v / max * 100 : 2 }));
  }

  // ---- DONUT ----
  desenharDonut(): void {
    const canvas = this.donutCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = 80, cy = 80, r = 60, ir = 38;
    let startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, 160, 160);
    this.donutData.forEach(d => {
      const slice = (d.val / 100) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath(); ctx.fillStyle = d.color; ctx.fill();
      startAngle += slice;
    });
    ctx.beginPath(); ctx.arc(cx, cy, ir, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.fillStyle = '#2D2D2D'; ctx.font = 'bold 18px DM Sans';
    ctx.textAlign = 'center'; ctx.fillText('47', cx, cy + 4);
    ctx.font = '10px DM Sans'; ctx.fillStyle = '#6B7280';
    ctx.fillText('eventos', cx, cy + 18);
  }

  // ---- CATÁLOGO ----
  filtrarCatalog(val: string): void {
    this.filtroCatAtivo = val;
    this.produtosFiltrados = val === 'all' ? [...this.allProducts] : this.allProducts.filter(p => p.cat === val);
  }

  deleteProd(p: Produto): void {
    this.allProducts = this.allProducts.filter(x => x !== p);
    this.filtrarCatalog(this.filtroCatAtivo);
  }

  // ---- CADASTRO ----
  updatePreview(): void { /* reactive via ngModel */ }

  saveProduct(): void {
    if (!this.novoProd.nome) return;
    this.allProducts.unshift({
      name: this.novoProd.nome, cat: this.novoProd.categoria.toLowerCase(),
      catLabel: this.novoProd.categoria, desc: this.novoProd.desc,
      price: this.novoProd.preco, required: this.novoProd.tipo === 'obrigatorio',
      img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80'
    });
    this.prodSalvo = true;
    setTimeout(() => { this.prodSalvo = false; this.clearForm(); }, 3000);
  }

  clearForm(): void {
    this.novoProd = { nome:'', categoria:'Buffet', preco:0, tipo:'opcional', desc:'' };
  }

  // ---- AUTH ----
  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }
}
