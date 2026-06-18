/**
 * SERVICE: AdminService
 *
 * Gerencia as operações exclusivas do painel administrativo que não
 * pertencem a outros services (CatalogoService, OrcamentoService, AgendaService).
 *
 * Responsabilidades:
 *  - KPIs e métricas do dashboard
 *  - Faturamento mensal (gráfico de barras)
 *  - Distribuição de eventos por tipo (gráfico donut)
 *  - Perfil do administrador logado
 *
 * Endpoints Spring Boot esperados:
 *   GET /api/admin/dashboard              → DashboardKpi
 *   GET /api/admin/dashboard/faturamento  → FaturamentoMensal[]
 *   GET /api/admin/dashboard/por-tipo     → DistribuicaoTipo[]
 *   GET /api/admin/perfil                 → Admin
 *   PUT /api/admin/perfil                 → Admin atualizado
 *
 * NOTA: Todos esses endpoints requerem autenticação JWT.
 * O authInterceptor (auth.interceptor.ts) adiciona o token automaticamente.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Admin,
  DashboardKpi,
  FaturamentoMensal,
  DistribuicaoTipo,
  AtualizarAdminDto
} from '../../models/admin';

@Injectable({
  providedIn: 'root' // Singleton — disponível em toda a aplicação sem importar em módulos
})
export class AdminService {

  /** URL base da API Spring Boot — definida em environment.ts */
  private readonly baseUrl = environment.apiUrl;

  /**
   * HttpClient — injetado pelo Angular DI (Dependency Injection).
   * Já inclui o token JWT via authInterceptor registrado em app.config.ts.
   */
  constructor(private http: HttpClient) {}

  // ============================================================
  // DASHBOARD — KPIs e métricas
  // ============================================================

  /**
   * Busca os KPIs principais do dashboard.
   * O Spring Boot calcula via queries agregadas no MySQL:
   *   SELECT SUM(valor_total) FROM orcamentos WHERE status='aprovado' AND MONTH(criado_em)=MONTH(NOW())
   *
   * @returns Observable<DashboardKpi> com faturamento, pedidos, etc.
   */
  buscarKpis(): Observable<DashboardKpi> {
    return this.http.get<DashboardKpi>(`${this.baseUrl}/admin/dashboard`).pipe(
      /* Se o backend falhar, retorna KPIs zerados para não quebrar o painel */
      catchError(() => of({
        faturamentoMes:     0,
        pedidosMes:         0,
        eventosConfirmados: 0,
        pedidosPendentes:   0,
        variacaoFaturamento:0,
        variacaoPedidos:    0
      }))
    );
  }

  /**
   * Busca faturamento mês a mês do ano atual para o gráfico de barras.
   * Spring Boot: SELECT MONTH(criado_em) as mes, SUM(valor_total) as total
   *              FROM orcamentos WHERE YEAR(criado_em)=:ano AND status='aprovado'
   *              GROUP BY MONTH(criado_em)
   *
   * @param ano — ano desejado (padrão: ano atual)
   * @returns Observable<FaturamentoMensal[]> com 12 meses
   */
  buscarFaturamentoAnual(ano?: number): Observable<FaturamentoMensal[]> {
    const anoConsulta = ano || new Date().getFullYear();
    return this.http.get<FaturamentoMensal[]>(
      `${this.baseUrl}/admin/dashboard/faturamento?ano=${anoConsulta}`
    ).pipe(
      /* Fallback com dados de exemplo para desenvolvimento */
      catchError(() => of(this.dadosFaturamentoExemplo()))
    );
  }

  /**
   * Busca distribuição de pedidos por tipo de evento para o gráfico donut.
   * Spring Boot: SELECT tipo_evento, COUNT(*) as quantidade FROM orcamentos GROUP BY tipo_evento
   *
   * @returns Observable<DistribuicaoTipo[]>
   */
  buscarDistribuicaoPorTipo(): Observable<DistribuicaoTipo[]> {
    return this.http.get<DistribuicaoTipo[]>(
      `${this.baseUrl}/admin/dashboard/por-tipo`
    ).pipe(
      catchError(() => of([
        { tipo: 'Casamento',  quantidade: 40, percentual: 40, cor: '#444444' },
        { tipo: '15 Anos',    quantidade: 30, percentual: 30, cor: '#888888' },
        { tipo: 'Infantil',   quantidade: 20, percentual: 20, cor: '#c0c0c0' },
        { tipo: 'Outros',     quantidade: 10, percentual: 10, cor: '#1a1a1a' }
      ]))
    );
  }

  // ============================================================
  // PERFIL DO ADMINISTRADOR
  // ============================================================

  /**
   * Busca os dados do admin logado.
   * Spring Boot: GET /api/admin/perfil → retorna dados do admin via JWT claim (email/id)
   *
   * @returns Observable<Admin>
   */
  buscarPerfil(): Observable<Admin> {
    return this.http.get<Admin>(`${this.baseUrl}/admin/perfil`);
  }

  /**
   * Atualiza os dados do administrador logado.
   * Spring Boot: PUT /api/admin/perfil com body AtualizarAdminDto
   *
   * Para trocar senha, o Spring Boot valida a senhaAtual antes de atualizar.
   *
   * @param dados — campos a atualizar (nome, email, senha)
   * @returns Observable<Admin> com os dados atualizados
   */
  atualizarPerfil(dados: AtualizarAdminDto): Observable<Admin> {
    return this.http.put<Admin>(`${this.baseUrl}/admin/perfil`, dados);
  }

  // ============================================================
  // HELPERS PRIVADOS — Dados de exemplo (fallback sem backend)
  // ============================================================

  /**
   * Gera dados de faturamento de exemplo para os 12 meses.
   * Usado como fallback quando o backend não está disponível.
   */
  private dadosFaturamentoExemplo(): FaturamentoMensal[] {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const valores = [12000,18500,9800,23000,16700,28900,21000,19500,25000,31000,17500,22000];

    return meses.map((nomeMes, i) => ({
      mes:        i + 1,
      nomeMes,
      total:      valores[i],
      quantidade: Math.floor(valores[i] / 5000) + 1
    }));
  }
}
