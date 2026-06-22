import {
  Component, OnInit, ViewChild, ElementRef, ViewEncapsulation
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

interface ItemServico {
  id: string; nome: string; desc: string; preco: number;
  imagem: string; obrigatorio: boolean; categoriaId: string;
}
interface CategoriaServico {
  id: string; nome: string; icone: string; itens: ItemServico[];
}
interface Tema {
  nome: string; tipo: string; imagem: string; preco: number;
}

@Component({
  selector: 'app-orcamento',
  imports: [CommonModule, FormsModule, RouterModule, TitleCasePipe],
  templateUrl: './orcamento-component.html',
  styleUrl: './orcamento-component.css',
  encapsulation: ViewEncapsulation.None
})
export class OrcamentoComponent implements OnInit {

  @ViewChild('temasTrack2') temasTrack!: ElementRef<HTMLDivElement>;

  etapaAtual = 1;
  etapas = ['Evento', 'Tema', 'Serviços', 'Confirmar'];

  tipoSelecionado = 'Casamento';
  temaSelecionado = '';
  temaPreco = 0;
  dataMinima = new Date().toISOString().split('T')[0];
  enviando = false;
  modalAberto = false;
  numeroPedido = '';

  dadosForm = {
    dataEvento: '', convidados: 100, faixaPreco: 'medio',
    nome: '', email: '', whatsapp: '', horario: 'Manhã (8h–12h)', observacoes: ''
  };

  tiposEvento = [
    { valor:'Casamento',   nome:'Casamento',   icone:'💍' },
    { valor:'15 Anos',     nome:'15 Anos',      icone:'👑' },
    { valor:'Infantil',    nome:'Infantil',     icone:'🎈' },
    { valor:'Floral',      nome:'Floral',       icone:'🌸' },
    { valor:'Temático',    nome:'Temático',     icone:'🎭' },
    { valor:'Corporativo', nome:'Corporativo',  icone:'🏢' }
  ];

  temas: Tema[] = [
    { nome:'Jardim Floral',    tipo:'Casamento / 15 Anos', imagem:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=400&q=80', preco:1800 },
    { nome:'Branco & Dourado', tipo:'Casamento',           imagem:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', preco:2400 },
    { nome:'Super Heróis',     tipo:'Infantil',             imagem:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', preco:1200 },
    { nome:'Glamour Neon',     tipo:'15 Anos / Temático',  imagem:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80', preco:2100 },
    { nome:'Espaço Sideral',   tipo:'Infantil / Temático', imagem:'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80', preco:1400 },
    { nome:'Jardim Encantado', tipo:'Infantil / Floral',   imagem:'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&q=80', preco:1600 },
    { nome:'Balada Teen',      tipo:'15 Anos / Temático',  imagem:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80', preco:1900 },
    { nome:'Rústico Chique',   tipo:'Casamento',           imagem:'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80', preco:2200 }
  ];

  categorias: CategoriaServico[] = [
    { id:'buffet', nome:'Buffet', icone:'🍽️', itens:[
      { id:'b1', nome:'Buffet Básico',   desc:'Entrada, prato e sobremesa para todos.',      preco:3500, imagem:'https://images.unsplash.com/photo-1555244162-803834f70033?w=300&q=80', obrigatorio:true,  categoriaId:'buffet' },
      { id:'b2', nome:'Buffet Premium',  desc:'Gastronomia ao vivo com opções exclusivas.',  preco:7200, imagem:'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&q=80', obrigatorio:false, categoriaId:'buffet' },
      { id:'b3', nome:'Coquetel',        desc:'Mesa de finger foods e canapés premium.',     preco:1800, imagem:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80', obrigatorio:false, categoriaId:'buffet' }
    ]},
    { id:'bolo', nome:'Bolo', icone:'🎂', itens:[
      { id:'bo1', nome:'Bolo Cenográfico', desc:'Display elegante para fotos.',      preco:890,  imagem:'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=300&q=80', obrigatorio:true,  categoriaId:'bolo' },
      { id:'bo2', nome:'Bolo 3 Andares',   desc:'Recheios variados à cobertura.',   preco:1200, imagem:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80', obrigatorio:false, categoriaId:'bolo' },
      { id:'bo3', nome:'Mesa de Doces',     desc:'Brigadeiros, trufas e bem-casados.', preco:680, imagem:'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&q=80', obrigatorio:false, categoriaId:'bolo' }
    ]},
    { id:'decoracao', nome:'Decoração', icone:'💐', itens:[
      { id:'d1', nome:'Decor Luxo',       desc:'Arranjos florais completos.',    preco:4800, imagem:'https://images.unsplash.com/photo-1490750967868-88df5691cc3b?w=300&q=80', obrigatorio:true,  categoriaId:'decoracao' },
      { id:'d2', nome:'Arco de Balões',   desc:'Backdrop especial para fotos.', preco:480,  imagem:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&q=80', obrigatorio:false, categoriaId:'decoracao' },
      { id:'d3', nome:'Iluminação Cênica',desc:'LED e iluminação especiais.',   preco:790,  imagem:'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&q=80', obrigatorio:false, categoriaId:'decoracao' }
    ]},
    { id:'musica', nome:'Música & Animação', icone:'🎵', itens:[
      { id:'m1', nome:'DJ & Música',   desc:'DJ profissional 6h.',          preco:800,  imagem:'https://images.unsplash.com/photo-1571266752461-eff34b1f01cd?w=300&q=80', obrigatorio:false, categoriaId:'musica' },
      { id:'m2', nome:'Animadores',    desc:'Equipe de entretenimento.',     preco:1200, imagem:'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=300&q=80', obrigatorio:false, categoriaId:'musica' },
      { id:'m3', nome:'Fotografia',    desc:'Fotógrafo profissional.',       preco:1500, imagem:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&q=80', obrigatorio:false, categoriaId:'musica' },
      { id:'m4', nome:'Bartender',     desc:'Open bar premium.',             preco:690,  imagem:'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300&q=80', obrigatorio:false, categoriaId:'musica' }
    ]}
  ];

  itensSelecionados: ItemServico[] = [];
  private carouselOffsets: Record<string, number> = {};
  private temasOffset = 0;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  bgUrl(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  ngOnInit(): void {
    this.categorias.forEach(cat =>
      cat.itens.filter(i => i.obrigatorio).forEach(i => {
        if (!this.itensSelecionados.find(s => s.id === i.id)) this.itensSelecionados.push(i);
      })
    );
    this.route.queryParams.subscribe(p => { if (p['tipo']) this.tipoSelecionado = p['tipo']; });
  }

  selecionarTipo(valor: string): void { this.tipoSelecionado = valor; }
  ajustarConvidados(delta: number): void { this.dadosForm.convidados = Math.max(20, Math.min(1000, this.dadosForm.convidados + delta)); }

  selecionarTema(tema: Tema): void { this.temaSelecionado = tema.nome; this.temaPreco = tema.preco; }

  shiftTemas(dir: number): void {
    const track = this.temasTrack?.nativeElement;
    if (!track) return;
    const max = track.scrollWidth - (track.parentElement?.offsetWidth || 0);
    this.temasOffset = Math.max(0, Math.min(this.temasOffset + dir * 236 * 2, max));
    track.style.transform = `translateX(-${this.temasOffset}px)`;
  }

  isSelected(item: ItemServico): boolean { return !!this.itensSelecionados.find(s => s.id === item.id); }

  toggleItem(item: ItemServico): void {
    if (item.obrigatorio) return;
    const idx = this.itensSelecionados.findIndex(s => s.id === item.id);
    if (idx > -1) this.itensSelecionados.splice(idx, 1);
    else this.itensSelecionados.push(item);
  }

  removerItem(item: ItemServico): void {
    if (item.obrigatorio) return;
    this.itensSelecionados = this.itensSelecionados.filter(s => s.id !== item.id);
  }

  shiftCarousel(id: string, dir: number): void {
    const track = document.getElementById(`${id}-track`);
    const viewport = document.getElementById(`${id}-viewport`);
    if (!track || !viewport) return;
    if (!this.carouselOffsets[id]) this.carouselOffsets[id] = 0;
    const max = track.scrollWidth - viewport.offsetWidth;
    this.carouselOffsets[id] = Math.max(0, Math.min(this.carouselOffsets[id] + dir * 236 * 2, max));
    track.style.transform = `translateX(-${this.carouselOffsets[id]}px)`;
  }

  get subtotal(): number { return this.itensSelecionados.reduce((a, i) => a + i.preco, 0) + this.temaPreco; }
  get taxa(): number { return this.subtotal * 0.05; }
  get total(): number { return this.subtotal + this.taxa; }

  private fmt(v: number): string { return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits:2 })}`; }
  get subtotalFormatado(): string { return this.fmt(this.subtotal); }
  get taxaFormatada():    string { return this.fmt(this.taxa); }
  get totalFormatado():   string { return this.fmt(this.total); }

  avancarEtapa(): void { if (this.etapaAtual < 4) this.etapaAtual++; }
  voltarEtapa():  void { if (this.etapaAtual > 1) this.etapaAtual--; }
  irParaConfirmacao(): void { this.etapaAtual = 4; }

  salvarRascunho(): void {
    const btn = document.querySelector('.btn-save-budget') as HTMLButtonElement;
    if (!btn) return;
    const orig = btn.textContent!;
    btn.textContent = '✓ Rascunho salvo!';
    btn.style.color = '#10B981'; btn.style.borderColor = '#10B981';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
  }

  enviarPedido(): void {
    this.enviando = true;
    setTimeout(() => {
      this.enviando = false;
      this.numeroPedido = `#FP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5,'0')}`;
      this.modalAberto = true;
    }, 1200);
  }
}
