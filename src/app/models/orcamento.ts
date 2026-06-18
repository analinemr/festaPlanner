/**
 * MODELO: Orçamento
 * Representa um orçamento criado pelo cliente
 * Mapeado para a tabela `orcamentos` no MySQL via Spring Boot JPA
 */
export interface Orcamento {
  /** Identificador único do orçamento */
  id?: number;

  /** Nome do cliente que solicitou o orçamento */
  nomeCliente: string;

  /** E-mail de contato do cliente */
  emailCliente: string;

  /** Telefone/WhatsApp do cliente */
  telefoneCliente: string;

  /** Tipo do evento: 'casamento' | 'debutante' | 'infantil' | 'floral' | 'corporativo' | 'outro' */
  tipoEvento: string;

  /** Data desejada para o evento (formato ISO 8601: YYYY-MM-DD) */
  dataEvento: string;

  /** Número estimado de convidados */
  numeroConvidados: number;

  /** Lista de IDs dos itens do catálogo selecionados */
  itensIds: number[];

  /** Valor total calculado do orçamento (soma dos itens + taxa) */
  valorTotal: number;

  /** Status do orçamento: 'pendente' | 'aprovado' | 'negociacao' | 'cancelado' */
  status: string;

  /** Data/hora de criação — preenchida automaticamente pelo Spring Boot */
  criadoEm?: string;

  /** Observações adicionais do cliente */
  observacoes?: string;
}
