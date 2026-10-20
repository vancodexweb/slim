import dataSource from './data-source';
import { GiftTier } from '../gifts/gift-tier.enum';
import { Gift } from '../gifts/entities/gift.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';

// Фиксированные id: повторный запуск обновляет те же записи и не создаёт дублей
const giftId = (n: number) =>
  `a1000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const orderId = (n: number) =>
  `b2000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const itemId = (orderNumber: number, position: number) =>
  `c3000000-0000-4000-8000-${String(orderNumber * 100 + position).padStart(12, '0')}`;

const picture = (slug: string) => `https://picsum.photos/seed/${slug}/600/400`;

const gifts: Gift[] = [
  {
    title: 'Набор для домашнего спа',
    description:
      'Соль для ванны, масло для тела и свеча с запахом лаванды для вечера дома.',
    category: 'spa',
    price: 3200,
    tier: GiftTier.Basic,
    rating: 4.5,
    imageUrl: picture('home-spa'),
  },
  {
    title: 'Сертификат на массаж',
    description: 'Расслабляющий массаж всего тела, 60 минут, на любой день.',
    category: 'spa',
    price: 5500,
    tier: GiftTier.Premium,
    rating: 4.8,
    imageUrl: picture('massage'),
  },
  {
    title: 'Спа-день на двоих',
    description:
      'Сауна, хаммам, массаж и чай в тихой спа-зоне для двоих на полдня.',
    category: 'spa',
    price: 14900,
    tier: GiftTier.Luxury,
    rating: 4.9,
    imageUrl: picture('spa-day'),
  },
  {
    title: 'Диффузор с эфирными маслами',
    description:
      'Ультразвуковой диффузор и три масла: лаванда, бергамот, эвкалипт.',
    category: 'aromatherapy',
    price: 2800,
    tier: GiftTier.Basic,
    rating: 4.3,
    imageUrl: picture('diffuser'),
  },
  {
    title: 'Набор ароматических свечей',
    description: 'Пять соевых свечей с древесными и цветочными ароматами.',
    category: 'aromatherapy',
    price: 4100,
    tier: GiftTier.Premium,
    rating: 4.6,
    imageUrl: picture('candles'),
  },
  {
    title: 'Коллекция эфирных масел',
    description: 'Двенадцать масел в деревянной шкатулке с подробным буклетом.',
    category: 'aromatherapy',
    price: 8700,
    tier: GiftTier.Luxury,
    rating: 4.7,
    imageUrl: picture('oils-box'),
  },
  {
    title: 'Травяной чай «Спокойный вечер»',
    description: 'Ромашка, мята и мелисса. Смесь для спокойного вечера.',
    category: 'tea',
    price: 900,
    tier: GiftTier.Basic,
    rating: 4.1,
    imageUrl: picture('calm-tea'),
  },
  {
    title: 'Подарочный набор чая',
    description:
      'Шесть сортов листового чая в красивой коробке и фильтр-ситечко.',
    category: 'tea',
    price: 2500,
    tier: GiftTier.Premium,
    rating: 4.4,
    imageUrl: picture('tea-set'),
  },
  {
    title: 'Чайная церемония с мастером',
    description:
      'Двухчасовая церемония с дегустацией редких улунов для небольшой компании.',
    category: 'tea',
    price: 9800,
    tier: GiftTier.Luxury,
    rating: 4.8,
    imageUrl: picture('tea-ceremony'),
  },
  {
    title: 'Увлажняющая маска для лица',
    description: 'Набор из десяти тканевых масок с гиалуроновой кислотой.',
    category: 'skincare',
    price: 1500,
    tier: GiftTier.Basic,
    rating: 4.0,
    imageUrl: picture('face-masks'),
  },
  {
    title: 'Набор ухода за кожей',
    description:
      'Крем, сыворотка и тоник на натуральной основе для ежедневного ухода.',
    category: 'skincare',
    price: 6300,
    tier: GiftTier.Premium,
    rating: 4.7,
    imageUrl: picture('skincare-set'),
  },
  {
    title: 'Коврик и блоки для йоги',
    description: 'Нескользящий коврик, два блока и ремень для растяжки.',
    category: 'yoga',
    price: 3900,
    tier: GiftTier.Basic,
    rating: 4.2,
    imageUrl: picture('yoga-mat'),
  },
  {
    title: 'Абонемент на йогу',
    description:
      'Восемь занятий в студии на выбор: хатха, виньяса или йога-нидра.',
    category: 'yoga',
    price: 7200,
    tier: GiftTier.Premium,
    rating: 4.6,
    imageUrl: picture('yoga-pass'),
  },
  {
    title: 'Утяжелённое одеяло',
    description:
      'Одеяло 7 кг из хлопка помогает быстрее уснуть и лучше выспаться.',
    category: 'sleep',
    price: 11500,
    tier: GiftTier.Luxury,
    rating: 4.9,
    imageUrl: picture('weighted-blanket'),
  },
  {
    title: 'Набор для ухода за руками и ногами',
    description: 'Скраб, крем и маска для рук и ног с маслом ши.',
    category: 'spa',
    price: 2100,
    tier: GiftTier.Basic,
    rating: 4.2,
    imageUrl: picture('hands-feet'),
  },
  {
    title: 'Банный набор «Сибирский»',
    description: 'Банная шапка, рукавица и травяной сбор для парной.',
    category: 'spa',
    price: 3400,
    tier: GiftTier.Premium,
    rating: 4.4,
    imageUrl: picture('banya'),
  },
  {
    title: 'Спрей для подушки «Крепкий сон»',
    description: 'Спрей с лавандой и ромашкой, пара брызг перед сном.',
    category: 'aromatherapy',
    price: 1200,
    tier: GiftTier.Basic,
    rating: 4.0,
    imageUrl: picture('pillow-spray'),
  },
  {
    title: 'Аромакулон с набором масел',
    description: 'Серебряный аромакулон и три масла в дорожных флаконах.',
    category: 'aromatherapy',
    price: 4600,
    tier: GiftTier.Premium,
    rating: 4.5,
    imageUrl: picture('aroma-pendant'),
  },
].map((gift, index) => ({ id: giftId(index + 1), ...gift }));

// Заказы описаны номером подарка и количеством. Цены и суммы считаются из каталога выше
const orderDrafts = [
  {
    customerName: 'Анна Петрова',
    customerEmail: 'anna.petrova@example.com',
    recipient: 'Мария Петрова',
    comment: 'Это подарок на день рождения, пожалуйста, упакуйте красиво.',
    createdAt: new Date('2026-10-01T09:15:00Z'),
    lines: [
      [1, 1],
      [7, 2],
    ],
  },
  {
    customerName: 'Игорь Соколов',
    customerEmail: 'igor.sokolov@example.com',
    recipient: 'Елена Соколова',
    comment: null,
    createdAt: new Date('2026-10-05T14:40:00Z'),
    lines: [[3, 1]],
  },
  {
    customerName: 'Дарья Крылова',
    customerEmail: 'daria.krylova@example.com',
    recipient: 'Ольга Крылова',
    comment: 'Доставить до 15 числа.',
    createdAt: new Date('2026-10-09T18:05:00Z'),
    lines: [
      [5, 2],
      [10, 3],
      [12, 1],
    ],
  },
  {
    customerName: 'Максим Орлов',
    customerEmail: 'maxim.orlov@example.com',
    recipient: 'Команда отдела маркетинга',
    comment: 'Корпоративный подарок на конец квартала.',
    createdAt: new Date('2026-10-14T11:30:00Z'),
    lines: [
      [8, 5],
      [4, 5],
    ],
  },
  {
    customerName: 'Светлана Белова',
    customerEmail: 'svetlana.belova@example.com',
    recipient: 'Алексей Белов',
    comment: null,
    createdAt: new Date('2026-10-18T20:10:00Z'),
    lines: [
      [14, 1],
      [2, 1],
    ],
  },
];

async function seed() {
  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    await manager.save(Gift, gifts);

    for (const [index, draft] of orderDrafts.entries()) {
      const number = index + 1;

      const items = draft.lines.map(([giftNumber, quantity], position) => {
        const gift = gifts[giftNumber - 1];
        return {
          id: itemId(number, position + 1),
          orderId: orderId(number),
          giftId: gift.id,
          price: gift.price,
          quantity,
        };
      });
      const totalCents = items.reduce(
        (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
        0,
      );

      await manager.save(Order, {
        id: orderId(number),
        customerName: draft.customerName,
        customerEmail: draft.customerEmail,
        recipient: draft.recipient,
        comment: draft.comment,
        totalAmount: totalCents / 100,
        createdAt: draft.createdAt,
      });
      await manager.save(OrderItem, items);
    }
  });

  const giftsCount = await dataSource.getRepository(Gift).count();
  const ordersCount = await dataSource.getRepository(Order).count();
  console.log(`Seed выполнен: подарков ${giftsCount}, заказов ${ordersCount}`);

  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Seed не выполнен:', error);
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(1);
});
