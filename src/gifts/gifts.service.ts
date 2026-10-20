import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { GetGiftsQueryDto } from './dto/get-gifts-query.dto';
import { Gift } from './entities/gift.entity';

// Сначала лучшие по рейтингу, при равенстве — по названию (порядок всегда стабильный)
const BEST_FIRST: FindOptionsOrder<Gift> = { rating: 'DESC', title: 'ASC' };

const SUGGESTIONS_COUNT = 3;
const SIMILAR_COUNT = 4;

// Экранируем % и _ , чтобы пользовательский ввод не работал как маска LIKE
const escapeLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift)
    private readonly giftRepository: Repository<Gift>,
  ) {}

  async findAll(query: GetGiftsQueryDto) {
    const { search, category, tier, minPrice, maxPrice } = query;

    // Фильтры, которые комбинируются через AND
    const filters: FindOptionsWhere<Gift> = {};
    if (category) {
      filters.category = ILike(escapeLike(category));
    }
    if (tier) {
      filters.tier = tier;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      filters.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      filters.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      filters.price = LessThanOrEqual(maxPrice);
    }

    // Массив в where — это OR между элементами. Поиск совпадает с title ИЛИ с description,
    // а остальные фильтры повторяются в каждом элементе, поэтому остаются через AND
    const pattern = search ? `%${escapeLike(search)}%` : null;
    const where = pattern
      ? [
          { ...filters, title: ILike(pattern) },
          { ...filters, description: ILike(pattern) },
        ]
      : filters;

    const items = await this.giftRepository.find({ where, order: BEST_FIRST });

    // Ничего не нашлось — подсовываем три лучших подарка, чтобы страница не была пустой
    const suggestions = items.length
      ? []
      : await this.giftRepository.find({
          order: BEST_FIRST,
          take: SUGGESTIONS_COUNT,
        });

    return { items, suggestions };
  }

  async findOne(id: string) {
    const gift = await this.giftRepository.findOneBy({ id });
    if (!gift) {
      throw new NotFoundException('Подарок не найден');
    }

    // Похожие — из той же категории, но не сам подарок
    const similar = await this.giftRepository.find({
      where: { category: gift.category, id: Not(gift.id) },
      order: BEST_FIRST,
      take: SIMILAR_COUNT,
    });

    return { gift, similar };
  }
}
