/**
 * MODELO: Agenda / Evento no Calendário
 * Representa um evento confirmado na agenda da casa de festas
 * Mapeado para a tabela `agendas` no MySQL via Spring Boot JPA
 */
export interface Agenda {
  /** Identificador único do evento na agenda */
  id?: number;

  /** Título do evento (ex: "Casamento Silva & Santos") */
  titulo: string;

  /** Data de início do evento (formato ISO 8601) */
  dataInicio: string;

  /** Data de término do evento (formato ISO 8601) */
  dataFim: string;

  /** ID do orçamento vinculado a este evento */
  orcamentoId?: number;

  /** Nome do cliente responsável pelo evento */
  nomeCliente: string;

  /** Tipo do evento para colorização no calendário */
  tipoEvento: string;

  /** Cor de exibição no calendário (hex color) */
  cor?: string;

  /** Status do evento: 'confirmado' | 'reservado' | 'cancelado' */
  status: string;

  /** Observações internas do administrador */
  observacoes?: string;
}
