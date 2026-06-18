/**
 * SERVIÇO: Agenda / Calendário de Eventos
 *
 * Gerencia o calendário de eventos da casa de festas.
 *
 * Endpoints Spring Boot esperados:
 *   GET  /api/agendas            → Lista todos os eventos
 *   GET  /api/agendas/:id        → Busca evento por ID
 *   GET  /api/agendas/mes/:ano/:mes → Eventos de um mês específico
 *   POST /api/agendas            → Cria novo evento (admin)
 *   PUT  /api/agendas/:id        → Atualiza evento (admin)
 *   DELETE /api/agendas/:id      → Remove evento (admin)
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agenda } from '../../models/agenda';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  private apiUrl = `${environment.apiUrl}/agendas`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os eventos da agenda
   */
  listarTodos(): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(this.apiUrl);
  }

  /**
   * Busca eventos de um mês/ano específico para o calendário
   * @param ano - Ex: 2025
   * @param mes - Ex: 10 (outubro)
   */
  listarPorMes(ano: number, mes: number): Observable<Agenda[]> {
    return this.http.get<Agenda[]>(`${this.apiUrl}/mes/${ano}/${mes}`);
  }

  /**
   * Busca um evento específico pelo ID
   */
  buscarPorId(id: number): Observable<Agenda> {
    return this.http.get<Agenda>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo evento na agenda (admin)
   * Vincula automaticamente ao orçamento se orcamentoId for informado
   */
  criar(agenda: Agenda): Observable<Agenda> {
    return this.http.post<Agenda>(this.apiUrl, agenda);
  }

  /**
   * Atualiza um evento existente (admin)
   */
  atualizar(id: number, agenda: Agenda): Observable<Agenda> {
    return this.http.put<Agenda>(`${this.apiUrl}/${id}`, agenda);
  }

  /**
   * Remove um evento da agenda (admin)
   */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verifica disponibilidade de uma data
   * Retorna true se a data está livre, false se já tem evento
   */
  verificarDisponibilidade(data: string): Observable<{ disponivel: boolean }> {
    return this.http.get<{ disponivel: boolean }>(`${this.apiUrl}/disponibilidade/${data}`);
  }
}
