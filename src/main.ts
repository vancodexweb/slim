import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { formatValidationErrors } from './common/format-validation-errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Ошибка валидации',
          errors: formatValidationErrors(errors),
          statusCode: 400,
        }),
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
  });

  // Swagger UI: /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wellness Gift Shop')
    .setDescription('REST API магазина wellness-подарков')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(Number(config.getOrThrow('PORT')));
}
void bootstrap();
