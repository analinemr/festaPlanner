/**
 * MODEL: Home
 *
 * Interfaces para os dados exibidos na página inicial.
 * Atualmente os dados são estáticos no componente, mas este model
 * prepara a estrutura para quando você quiser carregar do banco via Spring Boot.
 *
 * Exemplos de endpoints futuros:
 *   GET /api/home/depoimentos  → depoimentos de clientes (tabela `depoimentos`)
 *   GET /api/home/banners      → slides do carrossel hero (tabela `banners`)
 *   GET /api/home/stats        → estatísticas da plataforma (calculadas no banco)
 *
 * Por que existe este model mesmo com dados estáticos?
 *   → Define o "contrato" entre o frontend e o backend futuro.
 *   → Garante type safety no TypeScript desde o início.
 *   → Quando o backend estiver pronto, apenas o HomeService muda — o componente não.
 */

/**
 * Slide do carrossel hero da home.
 * Futuramente: tabela `banners` no MySQL com campo imagem_url e ativo.
 */
export interface BannerHero {
  id?:      number;
  url:      string;   // URL da imagem (Unsplash, S3, servidor local)
  titulo?:  string;   // Texto sobreposto opcional
  subtitulo?: string;
  ativo?:   boolean;
  ordem?:   number;   // Para ordenar os slides
}

/**
 * Estatística exibida na barra abaixo do hero.
 * Futuramente calculada via COUNT/SUM no banco MySQL.
 */
export interface EstatisticaPlataforma {
  numero: string; // Ex: "1.200+", "98%", "5 min"
  label:  string; // Ex: "Festas Realizadas"
  icone?: string;
}

/**
 * Categoria de evento exibida no grid da home.
 * Pode ser estática ou carregada de uma tabela `categorias`.
 */
export interface CategoriaEvento {
  nome:      string; // "Casamento"
  descricao: string; // "Sofisticado & Intimista"
  tipo:      string; // QueryParam para /orcamento?tipo=casamento
  imagem:    string; // URL da imagem de fundo do card
}

/**
 * Tema decorativo exibido no carrossel horizontal.
 * Futuramente: tabela `temas` ou campo `tema` na tabela `catalogo`.
 */
export interface TemaEvento {
  nome:   string; // "Jardim Floral"
  tipo:   string; // "Casamento / 15 Anos"
  imagem: string; // URL da imagem de preview
  id?:    number;
}

/**
 * Depoimento de cliente — candidato a tabela no banco.
 * Futuramente: tabela `depoimentos` com moderação pelo admin.
 */
export interface Depoimento {
  id?:           number;
  nome:          string; // "Ana Carolina Silva"
  evento:        string; // "Casamento — Outubro 2024"
  texto:         string; // Texto do depoimento
  avaliacao?:    number; // 1-5 estrelas
  aprovado?:     boolean;
  fotoUrl?:      string;
}

/**
 * Etapa do "Como Funciona" — completamente estática, não precisa de banco.
 */
export interface EtapaProcesso {
  icone:    string;
  titulo:   string;
  descricao:string;
}
