import { ValidationError } from 'class-validator';

export interface FormattedError {
  field: string;
  messages: string[];
}

// Превращает дерево ошибок class-validator в плоский список.
// Для вложенных объектов поле выглядит как путь: items.0.quantity
export function formatValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): FormattedError[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];
    const nested = error.children?.length
      ? formatValidationErrors(error.children, field)
      : [];
    return [...own, ...nested];
  });
}
