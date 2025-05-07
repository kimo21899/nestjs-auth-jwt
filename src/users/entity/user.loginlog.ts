import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ResultType } from 'src/common/result-type';


@Entity()
export class UserLoginlog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  loginkey: number;

  @Column({ type: 'enum', enum: ResultType })
  loginResult: ResultType;

  @CreateDateColumn({type: 'timestamp'})
  createdAt: Date;
}
