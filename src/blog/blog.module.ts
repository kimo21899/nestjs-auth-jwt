import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { BlogCategory } from './entity/blog-category.entity';
import { BlogComment } from './entity/blog-comment.entity';
import { BlogPost } from './entity/blog-post.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserLoginlog } from 'src/users/entity/user.loginlog';

@Module({
  imports: [
      TypeOrmModule.forFeature([User, UserLoginlog, BlogCategory, BlogComment, BlogPost]),
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get<string>('JWT_SECRET', 'sescret-key'), // 환경 변수 사용
          signOptions: { expiresIn: '1h' },
        }),
        inject: [ConfigService],
      }),    
    ],
  controllers: [BlogController, AuthController],
  providers: [BlogService, AuthService]
})
export class BlogModule {

}