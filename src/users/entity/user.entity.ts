import { AfterLoad, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { RoleType } from "src/common/guards/role-type";
import { BlogPost } from "src/blog/entity/blog-post.entity";
import { BlogComment } from "src/blog/entity/blog-comment.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false,  type: 'varchar', length: 255, charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  nickname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false, default: "1234567890"})
  loginkey: string;

  @Column({ nullable: false, type: 'enum', enum: RoleType })
  authority: RoleType;

  @CreateDateColumn({ nullable: false, type: 'timestamp'})
  createdAt: Date;

  @UpdateDateColumn({ nullable: false, type:'timestamp'})
  updatedAt: Date; 

  @OneToMany(() => BlogPost, (post) => post.author)
  posts: BlogPost[];

  @OneToMany(() => BlogComment, (comment) => comment.author)
  comments: BlogComment[];

  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword() {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password !== this.tempPassword) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

}