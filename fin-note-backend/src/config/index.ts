import { ConfigService } from '@nestjs/config';
import { AppEnv } from '@interfaces/env';

const configService = new ConfigService<AppEnv, true>();

export const config = {
  main: {
    port: configService.getOrThrow('PORT', 3000, { infer: true }),
    host: configService.getOrThrow('HOST', 'localhost', { infer: true }),
    nodeEnv: configService.getOrThrow('NODE_ENV', 'development', {
      infer: true,
    }),
  },
};
