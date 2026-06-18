/**
 * SERVICE: PedidosService
 *
 * Gerencia os pedidos no painel administrativo.
 * Separado do OrcamentoService porque as operações são distintas:
 *
 *   OrcamentoService → perspectiva do CLIENTE:
 *     Criar orçamento, calcular total, enviar solicitação.
 *     Endpoints públicos (sem autenticação).
 *
 *   PedidosService → perspectiva do ADMINISTRADOR:
 *     Listar, filtrar, aprovar, cancelar, visualizar detalhes.
 *     Todos os endpoints requerem autenticação JWT.
 *
 * Endpoints Spring Boot esperados:
 *   GET  /api/pedidos                              → lista todos com filtros
 *   GET  /api/pedidos/:id                          → detalhe de um pedido
 *   GET  /api/pedidos?status=&dataInicio=&dataFim= → com filtros
 *   PUT  /api/pedidos/:id/status                   → atualiza status
 *   POST /api/pedidos/:id/observacao               → adiciona observação interna
 *   GET  /api/pedidos/exportar                     → CSV/Excel (futuramente)
 *
 * NOTA: O authInterceptor adiciona o token JWT automaticamente em todas as requisições.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Pedido } from '../../models/pedidos';

/** Filtros disponíveis para a listagem de pedidos */
export interface FiltrosPedido {
  status?:      string;   // "novo" | "em_analise" | "aprovado" | "cancelado"
  dataInicio?:  string;   // ISO: "2024-01-01"
  dataFim?:     string;   // ISO: "2024-12-31"
  busca?:       string;   // Nome do cliente ou tipo de evento
  pagina?:      number;   // Paginação: número da página (começa em 0)
  tamanho?:     number;   // Paginação: itens por página (padrão: 20)
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  private readonly pedidosUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // LISTAGEM E BUSCA
  // ============================================================

  /**
   * Lista todos os pedidos com filtros opcionais.
   * Spring Boot: GET /api/pedidos?status=novo&dataInicio=2024-01-01
   *
   * Os parâmetros são adicionados como query strings automaticamente
   * pelo HttpParams do Angular.
   *
   * @param filtros — objeto com os filtros a aplicar
   * @returns Observable<Pedido[]>
   */
  listarTodos(filtros?: FiltrosPedido): Observable<Pedido[]> {
    /* HttpParams → constrói a query string da URL de forma segura */
    let params = new HttpParams();

    if (filtros?.status)     params = params.set('status', filtros.status);
    if (filtros?.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim)    params = params.set('dataFim', filtros.dataFim);
    if (filtros?.busca)      params = params.set('busca', filtros.busca);
    if (filtros?.pagina !== undefined) params = params.set('pagina', filtros.pagina);
    if (filtros?.tamanho)    params = params.set('tamanho', filtros.tamanho);

    return this.http.get<Pedido[]>(this.pedidosUrl, { params }).pipe(
      catchError(() => of(this.dadosExemplo()))
    );
  }

  /**
   * Busca o detalhe completo de um pedido pelo ID.
   * Spring Boot: GET /api/pedidos/:id
   * Retorna o pedido com todos os itens selecionados (orcamento_itens).
   *
   * @param id — ID do pedido
   */
  buscarPorId(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.pedidosUrl}/${id}`);
  }

  /**
   * Lista apenas os pedidos com status "novo" — para notificações.
   * Spring Boot: GET /api/pedidos?status=novo
   *
   * @returns Observable<Pedido[]> apenas pendentes
   */
  listarNovos(): Observable<Pedido[]> {
    return this.listarTodos({ status: 'novo' });
  }

  // ============================================================
  // ATUALIZAÇÃO DE STATUS
  // ============================================================

  /**
   * Atualiza o status de um pedido no funil de vendas.
   * Spring Boot: PUT /api/pedidos/:id/status
   * Body: { "status": "aprovado" }
   *
   * Fluxo de status:
   *   novo → em_analise → aprovado (cria evento na agenda)
   *                    → cancelado
   *
   * Quando o Spring Boot aprova, pode automaticamente:
   *   1. Criar um registro na tabela `agendas`
   *   2. Enviar e-mail de confirmação ao cliente
   *
   * @param id — ID do pedido
   * @param status — novo status: "em_analise" | "aprovado" | "cancelado"
   * @returns Observable<Pedido> com o pedido atualizado
   */
  atualizarStatus(id: number, status: string): Observable<Pedido> {
    return this.http.put<Pedido>(
      `${this.pedidosUrl}/${id}/status`,
      { status }
    );
  }

  // ============================================================
  // OBSERVAÇÕES INTERNAS
  // ============================================================

  /**
   * Adiciona uma observação interna ao pedido (visível apenas no admin).
   * Spring Boot: POST /api/pedidos/:id/observacao
   * Body: { "observacao": "Cliente confirmou por telefone." }
   *
   * @param id — ID do pedido
   * @param observacao — texto da observação interna
   */
  adicionarObservacao(id: number, observacao: string): Observable<Pedido> {
    return this.http.post<Pedido>(
      `${this.pedidosUrl}/${id}/observacao`,
      { observacao }
    );
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Traduz o status do banco para exibição em português.
   * Reutilizável nos componentes sem duplicar código.
   */
  traduzirStatus(status: string): string {
    const mapa: Record<string, string> = {
      novo:       'Novo',
      em_analise: 'Em Análise',
      aprovado:   'Aprovado',
      cancelado:  'Cancelado',
      pendente:   'Pendente'
    };
    return mapa[status] || status;
  }

  /**
   * Retorna a classe CSS do badge de status para estilização no template.
   * Uso: [class]="pedidosService.classeBadge(pedido.status)"
   */
  classeBadge(status: string): string {
    return `status-${status}`;
  }

  /** Dados de exemplo para desenvolvimento sem backend */
  private dadosExemplo(): Pedido[] {
    return [
      { id:1, orcamentoId:1, nomeCliente:'Ana Carolina Silva',  emailCliente:'ana@email.com',     telefoneCliente:'(21)99999-0001', tipoEvento:'casamento',  dataEvento:'2025-10-15', numeroConvidados:200, valorTotal:32000, status:'novo'       },
      { id:2, orcamentoId:2, nomeCliente:'Marcos Oliveira',     emailCliente:'marcos@email.com',  telefoneCliente:'(21)99999-0002', tipoEvento:'debutante',  dataEvento:'2025-11-20', numeroConvidados:150, valorTotal:18500, status:'em_analise' },
      { id:3, orcamentoId:3, nomeCliente:'Fernanda Santos',     emailCliente:'fernanda@email.com',telefoneCliente:'(21)99999-0003', tipoEvento:'infantil',   dataEvento:'2025-09-28', numeroConvidados:80,  valorTotal:9800,  status:'aprovado'   },
      { id:4, orcamentoId:4, nomeCliente:'Roberto Alves',       emailCliente:'roberto@email.com', telefoneCliente:'(21)99999-0004', tipoEvento:'corporativo',dataEvento:'2025-12-10', numeroConvidados:300, valorTotal:45000, status:'aprovado'   },
      { id:5, orcamentoId:5, nomeCliente:'Juliana Costa',       emailCliente:'juliana@email.com', telefoneCliente:'(21)99999-0005', tipoEvento:'casamento',  dataEvento:'2026-02-14', numeroConvidados:180, valorTotal:28000, status:'novo'       }
    ];
  }
}
