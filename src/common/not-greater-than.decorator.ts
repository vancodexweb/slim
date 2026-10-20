import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Проверяет, что число в поле не больше числа из другого поля (например, minPrice <= maxPrice)
export function NotGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'notGreaterThan',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [otherProperty] = args.constraints as [string];
          const other = (args.object as Record<string, unknown>)[otherProperty];
          // Если одного из значений нет, сравнивать нечего
          if (typeof value !== 'number' || typeof other !== 'number') {
            return true;
          }
          return value <= other;
        },
      },
    });
  };
}
