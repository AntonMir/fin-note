import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from '@config';
import { setupSwagger } from '@swagger';

(async () => {
  const app = await NestFactory.create(AppModule);

  const logger: Logger = new Logger();

  app.setGlobalPrefix('api');

  setupSwagger(app);

  const PORT = config.main.port;
  const HOST = config.main.host;

  await app.listen(PORT, HOST, () => {
    logger.log(`Server is running on ${HOST}:${PORT}`);
  });
})();
