/**
 * ENVIRONMENT PROD — Configuração de Ambiente de Produção
 *
 * Usado automaticamente pelo Angular CLI ao executar:
 *   ng build --configuration production
 *
 * O CLI substitui environment.ts por este arquivo em produção
 * graças ao fileReplacements configurado no angular.json.
 *
 * IMPORTANTE: Atualizar a apiUrl com o endereço real do servidor
 * onde o Spring Boot estará hospedado (ex: VPS, Heroku, Railway, etc.)
 */
export const environment = {

  /** production: true → ativa otimizações do Angular (AOT, tree-shaking, minificação) */
  production: true,

  /**
   * apiUrl → URL base do backend Spring Boot em produção.
   *
   * Exemplos comuns de deploy:
   *   Railway:  'https://festaplanner-api.up.railway.app/api'
   *   Render:   'https://festaplanner-api.onrender.com/api'
   *   VPS:      'https://api.seudominio.com.br/api'
   *
   * SUBSTITUA pela URL real antes do deploy!
   */
  apiUrl: 'https://api.festaplanner.com.br/api'

};
