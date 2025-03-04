import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Nest Project')
    .setDescription('Project-1')
    .setVersion('0.0.1');

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  SwaggerModule.setup('api/documentation', app, document);
}
