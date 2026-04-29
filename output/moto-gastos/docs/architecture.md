# Arquitetura — Moto Gastos Frontend

## Visão Geral

Frontend SPA (Single Page Application) em React 18 + Vite + TypeScript consumindo API REST em Node.js/Express.

## Diagrama de Componentes

```
App
├── QueryClientProvider (TanStack Query)
├── AuthProvider (JWT + localStorage)
├── AlertaProvider (banners globais)
└── AppRouter
    ├── /login → LoginPage
    ├── /register → RegisterPage
    └── ProtectedRoute → AppShell
        ├── Sidebar (navegação)
        ├── TopBar (header + logout)
        └── Outlet
            ├── / → DashboardPage
            ├── /moto → MotoPage
            ├── /manutencoes/tipos → ManutencoesTiposPage
            ├── /manutencoes/status → ManutencoesStatusPage
            ├── /manutencoes/historico → ManutencoesHistoricoPage
            ├── /gastos → GastosPage
            └── /alertas → AlertasConfigPage
```

## Fluxo de Autenticação JWT

```
LoginPage → POST /auth/login
  → { token, user }
  → localStorage.setItem('moto_gastos_token', token)
  → AuthContext.setUser(user)
  → redirect para /

Axios interceptor (request):
  → injeta Authorization: Bearer {token} em todas as requests

Axios interceptor (response):
  → captura 401
  → localStorage.removeItem('moto_gastos_token')
  → window.location.href = '/login'
```

## Estratégia TanStack Query

### Query Keys
| Domínio | Query Key |
|---|---|
| Moto | `['moto']` |
| Tipos de manutenção | `['manutencoes', 'tipos']` |
| Status de manutenções | `['manutencoes', 'status']` |
| Histórico | `['manutencoes', 'realizadas', filtros]` |
| Resumo de gastos | `['gastos', 'resumo', periodo]` |
| Config de alertas | `['alertas', 'config']` |

### Invalidações
| Ação | Queries invalidadas |
|---|---|
| Registrar manutenção | `realizadas`, `status`, `resumo` |
| Editar moto | `moto`, `status` |
| Editar tipo | `tipos`, `status` |

## Fluxo de Dados

```
Página → Hook (TanStack Query) → api/ (Axios) → API Backend
                ↓
         React state → Componentes UI → Renderização
```
