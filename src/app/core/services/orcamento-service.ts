/**
 * SERVIÇO: Orçamentos
 *
 * Gerencia todas as operações de orçamentos com o backend Spring Boot.
 *
 * Endpoints Spring Boot esperados:
 *   GET    /api/orcamentos            → Lista todos (admin)
 *   GET    /api/orcamentos/:id        → Busca por ID
 *   POST   /api/orcamentos            → Cria novo orçamento (público)
 *   PUT    /api/orcamentos/:id/status → Atualiza status (admin)
 *   DELETE /api/orcamentos/:id        → Remove (admin)
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Orcamento } from '../../models/orcamento';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrcamentoService {

  private apiUrl = `${environment.apiUrl}/orcamentos`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os orçamentos (endpoint protegido — somente admin)
   * Filtros opcionais por status e data são passados como query params
   * Ex: GET /api/orcamentos?status=pendente&dataInicio=2025-01-01
   */
  listarTodos(filtros?: { status?: string; dataInicio?: string; dataFim?: string }): Observable<Orcamento[]> {
    /* Constrói os parâmetros de filtro dinamicamente */
    let params = new HttpParams();
    if (filtros?.status) params = params.set('status', filtros.status);
    if (filtros?.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params = params.set('dataFim', filtros.dataFim);

    return this.http.get<Orcamento[]>(this.apiUrl, { params });
  }

  /**
   * Busca orçamento por ID
   * @param id - ID do orçamento no MySQL
   */
  buscarPorId(id: number): Observable<Orcamento> {
    return this.http.get<Orcamento>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo orçamento — endpoint público (não requer autenticação)
   * O Spring Boot persiste no MySQL e envia e-mail de confirmação
   * @param orcamento - Dados do orçamento preenchidos pelo cliente
   */
  criar(orcamento: Orcamento): Observable<Orcamento> {
    return this.http.post<Orcamento>(this.apiUrl, orcamento);
  }

  /**
   * Atualiza o status de um orçamento (somente admin)
   * @param id - ID do orçamento
   * @param status - Novo status: 'aprovado' | 'negociacao' | 'cancelado'
   */
  atualizarStatus(id: number, status: string): Observable<Orcamento> {
    return this.http.put<Orcamento>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Calcula o total de um orçamento com base nos IDs dos itens selecionados
   * O backend busca os preços atuais no MySQL e soma com a taxa de serviço
   * @param itensIds - Array de IDs dos itens selecionados
   */
  calcularTotal(itensIds: number[]): Observable<{ total: number; taxa: number; subtotal: number }> {
    return this.http.post<{ total: number; taxa: number; subtotal: number }>(
      `${this.apiUrl}/calcular`, { itensIds }
    );
  }

  /**
   * Remove um orçamento (somente admin)
   * @param id - ID do orçamento a remover
   */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
