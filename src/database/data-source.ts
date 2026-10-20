import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

// Из src запускаем .ts (ts-node), из dist после сборки — .js
const isTs = __filename.endsWith('.ts');
const root = isTs ? 'src' : 'dist';
const ext = isTs ? 'ts' : 'js';

// Источник данных для CLI TypeORM (миграции) и для seed
export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>('DB_HOST'),
  port: Number(configService.getOrThrow('DB_PORT')),
  username: configService.getOrThrow<string>('DB_USER'),
  password: configService.getOrThrow<string>('DB_PASS'),
  database: configService.getOrThrow<string>('DB_NAME'),
  entities: [`${root}/**/*.entity.${ext}`],
  migrations: [`${root}/database/migrations/*.${ext}`],
  synchronize: false,
});
