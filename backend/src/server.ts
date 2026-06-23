import dotenv from 'dotenv';
import path from 'path';
import app from './app';
import sequelize from './config/database';
import { initializeModels } from './models';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Umzug = require('umzug');

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 30;
const RETRY_DELAY_MS = 2000;

async function waitForDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sequelize.authenticate();
      return;
    } catch {
      if (attempt === MAX_RETRIES) {
        throw new Error(`Database unreachable after ${MAX_RETRIES} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

async function runMigrations(): Promise<void> {
  const umzug = new Umzug({
    migrations: {
      path: path.join(__dirname, 'migrations'),
      params: [sequelize.getQueryInterface(), sequelize.constructor],
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize,
    },
  });

  await umzug.up();
}

async function runSeeders(): Promise<void> {
  const umzug = new Umzug({
    migrations: {
      path: path.join(__dirname, 'seeders'),
      params: [sequelize.getQueryInterface(), sequelize.constructor],
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize,
      modelName: 'SequelizeSeederMeta',
    },
  });

  await umzug.up();
}

async function startServer(): Promise<void> {
  try {
    await waitForDatabase();
    await initializeModels();
    await runMigrations();
    await runSeeders();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
