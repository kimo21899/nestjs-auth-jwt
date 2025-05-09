import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { BlogPost } from './blog-post.entity';

@Entity()
export class BlogCategory extends BaseEntity {
  @Column({ nullable: false, length: 100,  charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  name: string;

  @Column({ nullable: false, type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_general_ci'})
  description?: string;

  @Column({ nullable: true })
  topImage?: string;

  @Column({ nullable: true })
  listImage?: string;

  @Column({ nullable: false})
  sortOrder: number;

  @OneToMany(() => BlogPost, (post) => post.category)
  posts: BlogPost[];
}