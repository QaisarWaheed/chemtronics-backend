/* eslint-disable @typescript-eslint/unbound-method */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BrandMiddleware } from './middlewares/brand.middleware';
import dns from 'dns';

async function bootstrap() {
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  const app = await NestFactory.create(AppModule);
  app.use(new BrandMiddleware().use);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API Description')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000, '0.0.0.0');
}
void bootstrap();
