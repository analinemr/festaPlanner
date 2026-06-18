/**
 * MODELO: Pedido / Solicitação de Orçamento
 * Representa uma solicitação enviada pelo cliente ao administrador
 * Mapeado para a tabela `pedidos` no MySQL via Spring Boot JPA
 */
export interface Pedido {
  /** Identificador único do pedido */
  id?: number;

  /** ID do orçamento base deste pedido */
  orcamentoId: number;

  /** Nome completo do cliente */
  nomeCliente: string;

  /** E-mail do cliente */
  emailCliente: string;

  /** Telefone do cliente */
  telefoneCliente: string;

  /** Tipo do evento solicitado */
  tipoEvento: string;

  /** Data desejada para o evento */
  dataEvento: string;

  /** Número de convidados */
  numeroConvidados: number;

  /** Valor total do orçamento selecionado */
  valorTotal: number;

  /** Status do pedido: 'novo' | 'em_analise' | 'aprovado' | 'cancelado' */
  status: string;

  /** Data/hora em que o pedido foi criado */
  criadoEm?: string;

  /** Observações adicionais */
  observacoes?: string;
}
