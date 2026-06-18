/**
 * MODELO: Produto/Serviço do Catálogo
 * Representa um item disponível para orçamento (buffet, bolo, decoração, etc.)
 * Mapeado para a tabela `catalogo` no MySQL via Spring Boot JPA
 */
export interface Catalogo {
  /** Identificador único — gerado pelo banco MySQL (AUTO_INCREMENT) */
  id?: number;

  /** Nome do produto ou serviço exibido na interface */
  nome: string;

  /** Descrição detalhada do item */
  descricao: string;

  /** Preço unitário em reais */
  preco: number;

  /** URL da imagem armazenada no servidor (ex: /uploads/imagem.jpg) */
  imagemUrl: string;

  /** Categoria do item: 'buffet' | 'bolo' | 'decoracao' | 'musica' | 'foto' | 'outro' */
  categoria: string;

  /** Define se o item é obrigatório no orçamento (não pode ser desmarcado) */
  obrigatorio: boolean;

  /** Define se o item está ativo e disponível para seleção */
  ativo: boolean;
}
