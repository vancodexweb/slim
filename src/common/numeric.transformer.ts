import { ValueTransformer } from 'typeorm';

// Postgres отдаёт numeric строкой ("19.99"), а в API нужны числа
export const numericTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string | null) => (value == null ? value : parseFloat(value)),
};
