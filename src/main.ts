/* eslint-disable @typescript-eslint/unbound-method */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BrandMiddleware } from './middlewares/brand.middleware';
import dns from 'dns';

async function bootstrap() {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  const port = Number(process.env.PORT || 3000);

  const app = await NestFactory.create(AppModule);
  app.use(new BrandMiddleware().use);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://chemtronics-backend-xufv.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('Your API Description')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
