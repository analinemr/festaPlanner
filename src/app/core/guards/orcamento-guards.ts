/**
 * SERVICE: PedidosService
 *
 * Gerencia os pedidos no painel administrativo.
 * Separado do OrcamentoService porque as operações são distintas:
 *
 *   OrcamentoService → perspectiva do CLIENTE:
 *     Criar orçamento, calcular total, enviar solicitação.
 *     Endpoints públicos (sem autenticação).
 *
 *   PedidosService → perspectiva do ADMINISTRADOR:
 *     Listar, filtrar, aprovar, cancelar, visualizar detalhes.
 *     Todos os endpoints requerem autenticação JWT.
 *
 * Endpoints Spring Boot esperados:
 *   GET  /api/pedidos                              → lista todos com filtros
 *   GET  /api/pedidos/:id                          → detalhe de um pedido
 *   GET  /api/pedidos?status=&dataInicio=&dataFim= → com filtros
 *   PUT  /api/pedidos/:id/status                   → atualiza status
 *   POST /api/pedidos/:id/observacao               → adiciona observação interna
 *   GET  /api/pedidos/exportar                     → CSV/Excel (futuramente)
 *
 * NOTA: O authInterceptor adiciona o token JWT automaticamente em todas as requisições.
 * Protege a rota /orcamento para garantir que o usuário
 * preencheu as informações necessárias antes de acessar
 * etapas avançadas do wizard.
 *
 * Casos de uso:
 *  1. Impede acesso direto por URL a etapas intermediárias do wizard
 *     sem ter preenchido os dados do evento (etapa 0).
 *  2. Pode verificar disponibilidade de datas antes de permitir
 *     o orçamento (verificação no backend).
 *  3. Pode bloquear acesso em horários fora do expediente
 *     (ex: formulário desativado nos finais de semana).
 *
 * Diferente do AuthGuard (que protege rotas que exigem LOGIN),
 * o OrcamentoGuard protege a integridade do FLUXO do wizard.
 *
 * Registrado em app.routes.ts:
 *   { path: 'orcamento', canActivate: [orcamentoGuard], component: OrcamentoComponent }
 */
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * orcamentoGuard — guard funcional (sintaxe Angular 17+, sem classe).
 *
 * Atualmente verifica:
 *  - Se o horário de atendimento está ativo (9h às 18h)
 *  - Se o sistema não está em manutenção
 *
 * Futuramente pode:
 *  - Verificar disponibilidade de datas via AgendaService
 *  - Checar se o catálogo tem itens cadastrados antes de permitir orçamento
 */
export const orcamentoGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  // ============================================================
  // VERIFICAÇÃO 1: Modo manutenção
  // Defina como `true` no environment.ts durante deploys
  // ============================================================
  const emManutencao = false; // environment.emManutencao

  if (emManutencao) {
    /* Redireciona para home com queryParam informando o motivo */
    router.navigate(['/home'], {
      queryParams: { aviso: 'manutencao' }
    });
    return false;
  }

  // ============================================================
  // VERIFICAÇÃO 2: Horário de atendimento
  // Opcional — desative comentando este bloco
  // ============================================================
  const verificarHorario = false; // Defina como `true` para ativar

  if (verificarHorario) {
    const agora = new Date();
    const hora = agora.getHours();
    const diaSemana = agora.getDay(); // 0=domingo, 6=sábado

    const dentroDoHorario = hora >= 9 && hora < 18;
    const diasUteis = diaSemana >= 1 && diaSemana <= 5;

    if (!dentroDoHorario || !diasUteis) {
      router.navigate(['/home'], {
        queryParams: { aviso: 'fora-horario' }
      });
      return false;
    }
  }

  // ============================================================
  // TODAS AS VERIFICAÇÕES PASSARAM
  // Permite acesso ao wizard de orçamento
  // ============================================================
  return true;
};
