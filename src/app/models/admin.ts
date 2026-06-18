/**
 * MODEL: Admin
 *
 * Representa o usuário administrador do sistema.
 * Corresponde à tabela `admins` no MySQL.
 *
 * Separado de login.ts para respeitar a estrutura definida no projeto
 * e permitir que o AdminService gerencie admins independentemente do AuthService.
 *
 * Tabela MySQL:
 *   CREATE TABLE admins (
 *     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
 *     nome       VARCHAR(120) NOT NULL,
 *     email      VARCHAR(180) NOT NULL UNIQUE,
 *     senha_hash VARCHAR(255) NOT NULL,
 *     ativo      BOOLEAN DEFAULT TRUE,
 *     criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
 *   );
 *
 * Endpoint Spring Boot:
 *   GET  /api/admin/perfil       → retorna dados do admin logado
 *   PUT  /api/admin/perfil       → atualiza dados do admin
 *   GET  /api/admin/dashboard    → retorna KPIs e métricas
 */

/** Representa um administrador cadastrado no banco */
export interface Admin {
  id?:       number;
  nome:      string;
  email:     string;
  ativo?:    boolean;
  criadoEm?: string; // ISO 8601: "2024-01-15T10:30:00"
}

/**
 * KPIs do dashboard — retornados pelo endpoint /api/admin/dashboard.
 * O Spring Boot calcula esses valores via queries no banco MySQL.
 */
export interface DashboardKpi {
  faturamentoMes:     number;  // Soma dos orçamentos aprovados no mês atual
  pedidosMes:         number;  // Total de pedidos recebidos no mês
  eventosConfirmados: number;  // Orçamentos com status 'aprovado'
  pedidosPendentes:   number;  // Orçamentos com status 'novo' ou 'em_analise'
  variacaoFaturamento:number;  // % de variação em relação ao mês anterior
  variacaoPedidos:    number;  // % de variação em relação ao mês anterior
}

/**
 * Dados mensais de faturamento para o gráfico de barras do dashboard.
 * Retornados por: GET /api/admin/dashboard/faturamento-anual
 */
export interface FaturamentoMensal {
  mes:         number; // 1-12
  nomeMes:     string; // "Janeiro", "Fevereiro"...
  total:       number; // Valor faturado no mês
  quantidade:  number; // Número de pedidos aprovados
}

/**
 * Distribuição de eventos por tipo — para o gráfico donut.
 * Retornados por: GET /api/admin/dashboard/por-tipo
 */
export interface DistribuicaoTipo {
  tipo:       string; // "casamento", "debutante"...
  quantidade: number;
  percentual: number; // 0-100
  cor:        string; // Hex para o gráfico: "#444444"
}

/** Payload para atualizar dados do administrador */
export interface AtualizarAdminDto {
  nome?:        string;
  email?:       string;
  senhaAtual?:  string; // Necessária para trocar senha
  novaSenha?:   string;
}
