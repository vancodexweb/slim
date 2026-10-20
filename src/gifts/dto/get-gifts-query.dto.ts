import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { NotGreaterThan } from '../../common/not-greater-than.decorator';
import { Trim } from '../../common/trim.decorator';
import { GiftTier } from '../gift-tier.enum';

export class GetGiftsQueryDto {
  // Поиск по title и description без учёта регистра
  @MaxLength(100, { message: 'Поисковый запрос слишком длинный' })
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  @Trim()
  @IsOptional()
  search?: string;

  @IsString({ message: 'Категория должна быть строкой' })
  @Trim()
  @IsOptional()
  category?: string;

  @IsEnum(GiftTier, {
    message: `Уровень должен быть одним из: ${Object.values(GiftTier).join(', ')}`,
  })
  @IsOptional()
  tier?: GiftTier;

  @NotGreaterThan('maxPrice', {
    message: 'minPrice не может быть больше maxPrice',
  })
  @Min(0, { message: 'minPrice не может быть меньше 0' })
  @IsNumber({}, { message: 'minPrice должен быть числом' })
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @Min(0, { message: 'maxPrice не может быть меньше 0' })
  @IsNumber({}, { message: 'maxPrice должен быть числом' })
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;
}
