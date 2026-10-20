import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/trim.decorator';

export class CreateOrderItemDto {
  @IsUUID('all', { message: 'Некорректный giftId' })
  giftId: string;

  @Max(100, { message: 'Количество одного подарка не больше 100' })
  @Min(1, { message: 'Количество должно быть не меньше 1' })
  @IsInt({ message: 'Количество должно быть целым числом' })
  quantity: number;
}

export class CreateOrderDto {
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @Trim()
  customerName: string;

  @MaxLength(255, { message: 'Email слишком длинный' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @Trim()
  customerEmail: string;

  @MaxLength(255, { message: 'Получатель не должен превышать 255 символов' })
  @IsString({ message: 'Получатель должен быть строкой' })
  @IsNotEmpty({ message: 'Получатель обязателен' })
  @Trim()
  recipient: string;

  @MaxLength(1000, { message: 'Комментарий не должен превышать 1000 символов' })
  @IsString({ message: 'Комментарий должен быть строкой' })
  @Trim()
  @IsOptional()
  comment?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @ArrayMinSize(1, { message: 'В заказе должна быть хотя бы одна позиция' })
  @IsArray({ message: 'items должен быть массивом' })
  items: CreateOrderItemDto[];
}
