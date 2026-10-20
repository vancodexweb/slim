import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Gift } from '../gifts/entities/gift.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

const GIFT_A = 'a1000000-0000-4000-8000-000000000001';
const GIFT_B = 'a1000000-0000-4000-8000-000000000002';

const gift = (id: string, price: number) => ({ id, price }) as Gift;

const orderData = {
  customerName: 'Иван',
  customerEmail: 'ivan@example.com',
  recipient: 'Мама',
};

describe('OrdersService.create', () => {
  let service: OrdersService;

  // Вместо настоящей базы подставляем менеджер транзакции с заглушками
  const manager = { find: jest.fn(), save: jest.fn() };
  const dataSource = { transaction: jest.fn() };

  beforeEach(async () => {
    manager.find.mockReset();
    manager.save.mockReset();
    dataSource.transaction.mockReset();
    dataSource.transaction.mockImplementation((callback) => callback(manager));

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = moduleRef.get(OrdersService);
  });

  it('считает сумму на сервере по ценам из базы и объединяет дубли', async () => {
    manager.find
      .mockResolvedValueOnce([gift(GIFT_A, 10.1), gift(GIFT_B, 19.99)])
      .mockResolvedValueOnce([{ id: 'order-1' }]);
    manager.save.mockResolvedValueOnce({ id: 'order-1' });

    await service.create({
      ...orderData,
      items: [
        { giftId: GIFT_A, quantity: 1 },
        { giftId: GIFT_B, quantity: 2 },
        { giftId: GIFT_A, quantity: 2 },
      ],
    });

    // 10.10 * 3 + 19.99 * 2 = 70.28
    expect(manager.save).toHaveBeenNthCalledWith(
      1,
      Order,
      expect.objectContaining({ totalAmount: 70.28 }),
    );
    // Дубли объединены: первый подарок x3, второй x2
    expect(manager.save).toHaveBeenNthCalledWith(2, OrderItem, [
      expect.objectContaining({ giftId: GIFT_A, price: 10.1, quantity: 3 }),
      expect.objectContaining({ giftId: GIFT_B, price: 19.99, quantity: 2 }),
    ]);
  });

  it('бросает 404 и ничего не сохраняет, если подарка нет в базе', async () => {
    manager.find.mockResolvedValueOnce([gift(GIFT_A, 10)]);

    await expect(
      service.create({
        ...orderData,
        items: [
          { giftId: GIFT_A, quantity: 1 },
          { giftId: GIFT_B, quantity: 1 },
        ],
      }),
    ).rejects.toThrow(NotFoundException);

    expect(manager.save).not.toHaveBeenCalled();
  });
});
