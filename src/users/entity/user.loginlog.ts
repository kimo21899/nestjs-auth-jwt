import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ResultType } from 'src/common/result-type';


@Entity()
export class UserLoginlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  loginkey: string;

  @Column({ type: 'enum', enum: ResultType })
  loginResult: ResultType;

  @Column({default: 'localhost'})
  connectUrl: string;

  @CreateDateColumn({type: 'timestamp'})
  createdAt: Date;
}
