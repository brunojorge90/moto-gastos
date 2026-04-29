# Moto Gastos — Frontend

Aplicativo web para rastreamento de gastos e manutenções de motocicleta.

## Pré-requisitos
- Node.js 18+
- Backend rodando em http://localhost:3001

## Instalação
```bash
npm install
cp .env.example .env.local
# Edite VITE_API_BASE_URL no .env.local
npm run dev
```

## Variáveis de ambiente
| Variável | Descrição | Padrão |
|---|---|---|
| VITE_API_BASE_URL | URL base da API backend | http://localhost:3001 |

## Telas disponíveis
- `/login` — Autenticação
- `/register` — Cadastro
- `/` — Dashboard com KM atual, alertas e resumo
- `/moto` — Cadastro e edição da motocicleta
- `/manutencoes/tipos` — Tipos de manutenção (CRUD)
- `/manutencoes/status` — Status com alertas visuais
- `/manutencoes/historico` — Histórico com filtros
- `/gastos` — Gráficos de gastos por tipo e por mês
- `/alertas` — Configuração de alertas e webhook N8N

## Estrutura de pastas
```
src/
  api/          # Chamadas HTTP por domínio (Axios)
  components/   # UI, layout, domínio (moto, manutenções, gastos, alertas)
  contexts/     # AuthContext, AlertaContext
  hooks/        # TanStack Query hooks por domínio
  pages/        # 9 páginas
  routes/       # AppRouter + ProtectedRoute
  lib/          # utils, constants
  types/        # Tipos TypeScript espelhando a API
```

## Scripts
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run test     # Testes (Vitest)
```
