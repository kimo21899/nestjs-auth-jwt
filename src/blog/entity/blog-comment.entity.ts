// blog-comment.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BlogPost } from './blog-post.entity';
import { BaseEntity } from './base.entity';
import { User } from 'src/users/entity/user.entity';

@Entity()
export class BlogComment extends BaseEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => BlogPost, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: BlogPost;

  @ManyToOne(() => BlogComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: BlogComment;

  @OneToMany(() => BlogComment, (comment) => comment.parent)
  replies: BlogComment[];
}