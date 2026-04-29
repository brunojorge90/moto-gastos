import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { initPostgres } from './db/init-postgres.js';
import authRoutes from './routes/auth.js';
import motoRoutes from './routes/moto.js';
import manutencoesRoutes from './routes/manutencoes.js';
import gastosRoutes from './routes/gastos.js';
import alertasRoutes from './routes/alertas.js';
import webhookRoutes from './routes/webhook.js';
import errorHandler from './middleware/errorHandler.js';
import { processarNotificacoesPendentes } from './services/notificacaoService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint público protegido por header secreto, para cron externo (cron-job.org).
// Acorda o serviço no Render free e dispara as notificações pendentes.
app.post('/cron/tick', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const r = await processarNotificacoesPendentes();
    console.log(`[cron-tick] enviadas=${r.enviadas} erros=${r.erros} usuarios=${r.totalUsuarios}`);
    res.json(r);
  } catch (err) {
    console.error('[cron-tick] erro:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/auth', authRoutes);
app.use('/moto', motoRoutes);
app.use('/manutencoes', manutencoesRoutes);
app.use('/gastos', gastosRoutes);
app.use('/alertas', alertasRoutes);
app.use('/webhook', webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use(errorHandler);

const start = async () => {
  try {
    await initPostgres();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Cron interno: só roda se RUN_INTERNAL_CRON=true.
    // Em produção (Render free, que dorme), use cron-job.org chamando POST /cron/tick.
    if (process.env.RUN_INTERNAL_CRON === 'true') {
      const cronExpr = process.env.NOTIFICACAO_CRON || '0 9 * * *';
      cron.schedule(cronExpr, async () => {
        console.log('[cron] Executando notificações Telegram...');
        try {
          const r = await processarNotificacoesPendentes();
          console.log(`[cron] enviadas=${r.enviadas} erros=${r.erros} usuarios=${r.totalUsuarios}`);
        } catch (err) {
          console.error('[cron] Falha geral:', err);
        }
      });
      console.log(`[cron] Agendado: "${cronExpr}" (notificações Telegram)`);
    } else {
      console.log('[cron] Cron interno desativado (RUN_INTERNAL_CRON != true). Use /cron/tick.');
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
