import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsOrder, In, Repository } from 'typeorm';
import { Gift } from '../gifts/entities/gift.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

// Позиции внутри заказа сортируем по названию подарка, чтобы порядок не прыгал
const ORDER_OPTIONS: FindOptionsOrder<Order> = {
  createdAt: 'DESC',
  items: { gift: { title: 'ASC' } },
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateOrderDto) {
    // Дубли giftId объединяем: количества суммируются в одну позицию
    const quantityByGift = new Map<string, number>();
    for (const item of dto.items) {
      const current = quantityByGift.get(item.giftId) ?? 0;
      quantityByGift.set(item.giftId, current + item.quantity);
    }
    const giftIds = [...quantityByGift.keys()];

    // Всё в одной транзакции: если что-то упадёт, не сохранится ни заказ, ни позиции
    return this.dataSource.transaction(async (manager) => {
      const gifts = await manager.find(Gift, { where: { id: In(giftIds) } });

      if (gifts.length !== giftIds.length) {
        const foundIds = new Set(gifts.map((gift) => gift.id));
        const missing = giftIds.filter((id) => !foundIds.has(id));
        throw new NotFoundException(
          `Подарки не найдены: ${missing.join(', ')}`,
        );
      }

      // Цены берём из базы, а не из запроса. Сумму считаем в копейках,
      // чтобы не накапливать ошибки округления дробных чисел
      let totalCents = 0;
      for (const gift of gifts) {
        const quantity = quantityByGift.get(gift.id) as number;
        totalCents += Math.round(gift.price * 100) * quantity;
      }

      const order = await manager.save(Order, {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        recipient: dto.recipient,
        comment: dto.comment || null,
        totalAmount: totalCents / 100,
      });

      await manager.save(
        OrderItem,
        gifts.map((gift) => ({
          orderId: order.id,
          giftId: gift.id,
          price: gift.price,
          quantity: quantityByGift.get(gift.id) as number,
        })),
      );

      // Возвращаем заказ вместе с позициями и подарками
      const [created] = await manager.find(Order, {
        where: { id: order.id },
        relations: { items: { gift: true } },
        order: ORDER_OPTIONS,
      });
      return created;
    });
  }

  findAll() {
    return this.orderRepository.find({
      relations: { items: { gift: true } },
      order: ORDER_OPTIONS,
    });
  }
}
