import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericTransformer } from '../../common/numeric.transformer';
import { Gift } from '../../gifts/entities/gift.entity';
import { Order } from './order.entity';

@Entity('order_items')
@Check('"quantity" >= 1')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  giftId: string;

  @ManyToOne(() => Gift)
  @JoinColumn({ name: 'giftId' })
  gift: Gift;

  // Цена за штуку на момент заказа: цена подарка потом может измениться
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  price: number;

  @Column({ type: 'int' })
  quantity: number;
}
