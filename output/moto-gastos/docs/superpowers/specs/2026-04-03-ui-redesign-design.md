# Design Spec — UI Redesign "Painel de Moto"

**Data:** 2026-04-03  
**Status:** Aprovado  

---

## 1. Objetivo

Redesenhar o visual do app Moto Gastos com tema dark/esportivo (estilo painel de moto), navegação responsiva e correção do bug na seção Gastos.

---

## 2. Paleta de Cores

Substituir as variáveis CSS em `src/index.css`:

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#0a0a0a` | Fundo da página |
| `--card` | `#141414` | Cards, sidebar |
| `--surface-raised` | `#1e1e1e` | Hover, inputs |
| `--border` | `#2a2a2a` | Bordas |
| `--primary` | `#f97316` | Laranja — accent, CTAs, ativo |
| `--primary-foreground` | `#0a0a0a` | Texto sobre laranja |
| `--foreground` | `#f5f5f5` | Texto principal |
| `--muted-foreground` | `#71717a` | Texto secundário |
| `--destructive` | `#ef4444` | Erro/danger |
| `--success` | `#22c55e` | Positivo |
| `--warning` | `#f59e0b` | Alerta |

---

## 3. Layout

### Desktop (≥ 1024px)
- **Top bar fixa** (h-14): logo "MotoGastos" + nome/km da moto atual + avatar com inicial do email
- **Sidebar esquerda colapsável**: 64px (só ícones) por padrão, 220px ao expandir via botão toggle
- Sidebar items com badge laranja quando há alertas ativos
- Conteúdo principal ocupa o espaço restante com padding consistente

### Mobile (< 1024px)
- Top bar simples (logo + avatar)
- **Bottom navigation** fixa com 5 destinos: Dashboard, Moto, Manutenção, Gastos, Alertas
- Sem sidebar

### Sidebar items
| Ícone | Label | Rota |
|-------|-------|------|
| LayoutDashboard | Dashboard | `/dashboard` |
| Bike | Minha Moto | `/moto` |
| Wrench | Manutenções | `/manutencoes/status` |
| DollarSign | Gastos | `/gastos` |
| Bell | Alertas | `/alertas` |

---

## 4. Componentes a Alterar

### `src/index.css`
- Substituir todas as variáveis CSS pelo novo tema dark

### `src/components/layout/AppShell.tsx`
- Implementar layout responsivo com sidebar colapsável (desktop) e bottom nav (mobile)

### `src/components/layout/TopBar.tsx`
- Mostrar nome da moto + km atual (busca do `useMoto`)
- Avatar com inicial do email

### `src/components/layout/Sidebar.tsx`
- Colapsável: 64px (ícones) / 220px (expandida)
- Badge laranja nos itens com alerta ativo

### `src/components/gastos/GastosMensalChart.tsx`
- Tema dark: fundo transparente, grid `#2a2a2a`, barras laranjas

### `src/components/gastos/GastosPorTipoChart.tsx`
- Cores do pie: laranja e variações (âmbar, vermelho, etc.)

### `src/components/gastos/ResumoCard.tsx`
- Adicionar 4º card: "Média Mensal" (total_periodo / periodo_meses)

---

## 5. Bug Fix — Seção Gastos Vazia

**Causa:** seed data tem datas de 2024; filtro de 12 meses a partir de 2026-04-03 não retorna nenhum registro.

**Correção:** Atualizar datas em `backend/src/db/init-sqlite.js` para os últimos 12 meses (abril 2025 — março 2026). Deletar `backend/moto-gastos.db` para forçar re-seed.

---

## 6. Fora de Escopo

- Não alterar lógica de negócio, rotas ou API
- Não adicionar novas páginas
- Não alterar componentes UI base (button, input, etc.) além das cores via CSS vars
