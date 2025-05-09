// blog-post.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BlogCategory } from './blog-category.entity';
import { BlogComment } from './blog-comment.entity';
import { BaseEntity } from './base.entity';
import { User } from 'src/users/entity/user.entity';


@Entity()
export class BlogPost extends BaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => BlogCategory, (category) => category.posts, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: BlogCategory;

  @OneToMany(() => BlogComment, (comment) => comment.post)
  comments: BlogComment[];
}