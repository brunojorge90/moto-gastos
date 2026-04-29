# Architecture Decision Records

## ADR-001: Vite como bundler em vez de Create React App

**Status:** Aceito

**Contexto:** O projeto precisava de um ambiente de desenvolvimento rápido com suporte a TypeScript nativo e hot module replacement eficiente.

**Decisão:** Usar Vite 5 com @vitejs/plugin-react.

**Consequências:** Builds de desenvolvimento significativamente mais rápidos. HMR instantâneo. CRA está em modo de manutenção; Vite é o padrão atual do ecossistema React.

---

## ADR-002: TanStack Query em vez de Redux/Zustand

**Status:** Aceito

**Contexto:** O estado da aplicação é predominantemente estado de servidor (dados da API), não estado de UI complexo.

**Decisão:** Usar TanStack Query v5 para cache, sincronização e invalidação de queries.

**Consequências:** Eliminação de boilerplate de Redux. Cache automático com staleTime configurável. Invalidação granular por query key após mutations. Menos código para loading/error states.

---

## ADR-003: shadcn/ui implementado manualmente em vez do CLI

**Status:** Aceito

**Contexto:** O CLI do shadcn/ui requer configuração interativa e pode gerar conflitos em ambientes automatizados.

**Decisão:** Implementar os componentes shadcn/ui diretamente em src/components/ui/ usando class-variance-authority e tailwind-merge.

**Consequências:** Controle total sobre os componentes. Sem dependência de CLI externo. Componentes customizáveis inline. Manutenção manual necessária para atualizações.

---

## ADR-004: Zod + React Hook Form para validação de formulários

**Status:** Aceito

**Contexto:** O projeto possui múltiplos formulários (login, cadastro de moto, tipos de manutenção, registro de manutenção) com validações específicas.

**Decisão:** Usar React Hook Form com @hookform/resolvers/zod para validação declarativa baseada em schema.

**Consequências:** Validação type-safe com inferência TypeScript automática a partir dos schemas Zod. Performance otimizada — RHF usa uncontrolled inputs. Re-renders minimizados.

---

## ADR-005: Estrutura de pastas por domínio

**Status:** Aceito

**Contexto:** O projeto cobre múltiplos domínios (moto, manutenções, gastos, alertas) com componentes, hooks e chamadas API específicas por área.

**Decisão:** Organizar src/components/, src/hooks/ e src/api/ por domínio em vez de por tipo técnico.

**Consequências:** Localização intuitiva de código relacionado. Facilita trabalho paralelo em features distintas. Componentes ui/ permanecem agnósticos de domínio em src/components/ui/.
