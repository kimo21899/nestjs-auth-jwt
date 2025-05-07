import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { RoleType } from 'src/common/guards/role-type';


@Entity()
export class UserAuthority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: RoleType })
  userAuthority: RoleType;

  @ManyToOne(() => User, user => user.authorities)
  user: User;
}
