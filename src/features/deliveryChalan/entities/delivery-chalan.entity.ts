import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('delivery_chalan')
export class DeliveryChalan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chalanNo: string;

  @Column({ type: 'date' })
  deliveryDate: string;

  @Column({ nullable: true })
  poNo: string;

  @Column({ type: 'date', nullable: true })
  poDate: string;

  @Column()
  partyName: string;

  @Column()
  partyAddress: string;
}
