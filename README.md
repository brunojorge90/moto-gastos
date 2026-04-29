# Moto Gastos

Aplicativo para rastreamento de gastos e manutenções de motocicleta com alertas automáticos via Telegram.

## Estrutura

```
.
├── backend/                  # API Node.js + Express + Postgres
└── output/moto-gastos/       # Frontend React 18 + Vite + TypeScript
```

## Stack

- **Backend**: Node.js 20+, Express, Postgres (via `pg`), JWT, node-cron, Telegram Bot API
- **Frontend**: React 18, Vite, TypeScript, Tailwind, TanStack Query, Recharts
- **Deploy**: Vercel (frontend) + Render (backend) + Neon (banco) + cron-job.org (cron externo)

## Desenvolvimento local

### Backend
```bash
cd backend
cp .env.example .env
# Edite DATABASE_URL e demais variáveis
npm install
npm run dev      # http://localhost:3001
```

### Frontend
```bash
cd output/moto-gastos
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3001
npm install
npm run dev      # http://localhost:5173
```

## Variáveis de ambiente (backend)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Connection string Postgres (`postgresql://...?sslmode=require`) |
| `JWT_SECRET` | sim | Segredo JWT (mín. 32 chars) |
| `TELEGRAM_BOT_TOKEN` | para Telegram | Token do bot (BotFather) |
| `CRON_SECRET` | para cron | Token usado pelo cron externo no header `x-cron-secret` |
| `RUN_INTERNAL_CRON` | não | `true` em dev / hosts sem sleep; `false` em Render free |
| `NOTIFICACAO_CRON` | não | Cron interno (default `0 9 * * 1` — segundas, 9h) |
| `FRONTEND_URL` | sim | URL do frontend (CORS) |
| `WEBHOOK_API_KEY` | opcional | Auth do `/webhook/alertas-pendentes` (legado N8N) |
| `PORT` | não | Porta (Render injeta automaticamente) |

## Variáveis de ambiente (frontend)

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL pública do backend |

## Deploy

### 1. Banco — Neon Postgres (free)

1. Criar conta em https://neon.tech
2. Criar projeto → copiar a `Connection string` (pooled)
3. Guardar para usar como `DATABASE_URL` no Render

### 2. Backend — Render (free)

1. Criar conta em https://render.com e conectar GitHub
2. New → Web Service → escolher esse repo
3. Render detecta o `render.yaml` na raiz e cria o serviço com `rootDir: backend`
4. Em **Environment**, preencher os `sync: false`:
   - `DATABASE_URL` = (do Neon)
   - `TELEGRAM_BOT_TOKEN` = (do BotFather)
   - `FRONTEND_URL` = (do Vercel, depois)
5. Salvar → deploy automático

### 3. Frontend — Vercel (free)

```bash
cd output/moto-gastos
npx vercel login
npx vercel --prod
```

Em variáveis de ambiente do projeto Vercel:
- `VITE_API_BASE_URL` = URL pública do Render

Atualizar `FRONTEND_URL` no Render com a URL do Vercel.

### 4. Cron externo — cron-job.org (free)

1. Criar conta em https://cron-job.org
2. Novo job:
   - URL: `https://<seu-render>.onrender.com/cron/tick`
   - Method: `POST`
   - Header: `x-cron-secret: <CRON_SECRET do Render>`
   - Schedule: semanal, segundas às 9h
3. Esse job acorda o backend (sleep do Render free) e dispara as notificações

## Funcionalidades

- Cadastro/login (JWT)
- Cadastro de moto (KM inicial, média diária, data de referência)
- Tipos de manutenção customizáveis (intervalo em km)
- Histórico de manutenções realizadas
- Status com cálculo automático de KM atual e KM restante
- Configuração de antecedência por tipo
- **Notificações no Telegram** quando manutenção entra na faixa de alerta
- Anti-spam: notifica 1× por ciclo, reseta ao registrar a manutenção
- Dashboard com gráficos (Recharts)
