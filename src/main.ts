import { NestFactory } from '@nestjs/core';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const formatted = errors.map((err) => ({
                    field: err.property,
                    messages: Object.values(err.constraints || {}),
                }));
                return new BadRequestException({
                    message: 'Ошибка валидации',
                    errors: formatted,
                    statusCode: 400,
                });
            },
        }),
    );

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });

  await app.listen(config.getOrThrow<number>('PORT'));
}
bootstrap();