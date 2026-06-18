/**
 * MODELO: Credenciais de Login
 * Enviado ao endpoint POST /api/auth/login do Spring Boot
 */
export interface Login {
  /** E-mail do administrador */
  email: string;

  /** Senha do administrador (enviada ao backend para validação) */
  senha: string;
}

/**
 * MODELO: Resposta de Autenticação
 * Recebida do Spring Boot após login bem-sucedido (JWT Token)
 */
export interface AuthResponse {
  /** Token JWT para autenticar as demais requisições */
  token: string;

  /** Tipo do token (geralmente 'Bearer') */
  tipo: string;

  /** Nome do administrador logado */
  nome: string;

  /** E-mail do administrador logado */
  email: string;

  /** Perfil de acesso: 'ADMIN' | 'FUNCIONARIO' */
  perfil: string;
}

/**
 * MODELO: Administrador do Sistema
 * Mapeado para a tabela `admins` no MySQL
 */
export interface Admin {
  id?: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
}
