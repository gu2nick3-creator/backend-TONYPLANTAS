import { createApp } from './src/app.mjs';
import { env } from './src/config/env.mjs';
import { initializeApplication } from './src/services/bootstrap.service.mjs';

async function startServer() {
  try {
    await initializeApplication();
    const app = createApp();

    app.listen(env.PORT, () => {
      console.log(`TonyPlantas API rodando em http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a API:', error);
    process.exit(1);
  }
}

startServer();
