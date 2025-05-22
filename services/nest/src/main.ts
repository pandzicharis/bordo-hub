import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './logger/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log(process.env.JWT_KEY);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
