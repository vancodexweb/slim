import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { numericTransformer } from '../../common/numeric.transformer';
import { GiftTier } from '../gift-tier.enum';

@Entity('gifts')
@Check('"rating" >= 0 AND "rating" <= 5')
export class Gift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  price: number;

  @Column({ type: 'varchar', length: 20 })
  tier: GiftTier;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
    transformer: numericTransformer,
  })
  rating: number;

  @Column({ type: 'text' })
  imageUrl: string;
}
