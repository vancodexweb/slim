import { Transform } from 'class-transformer';

// Обрезает пробелы по краям у строкового поля до валидации
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
