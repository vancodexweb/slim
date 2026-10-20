import { Inject } from '@nestjs/common';

// Заглушка для @nestjs/typeorm в юнит-тестах.
// Настоящий пакет — чистый ESM (с import.meta), а jest 30 грузит его только на Node 24.9+.
// В тестах нужны лишь токены репозиториев, поэтому воспроизводим их здесь.
export const getRepositoryToken = (entity: { name: string }) =>
  `${entity.name}Repository`;

export const InjectRepository = (entity: { name: string }) =>
  Inject(getRepositoryToken(entity));
