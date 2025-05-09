import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/users/entity/user.entity';
import { UserLoginlog } from 'src/users/entity/user.loginlog';
import { BlogCategory } from 'src/blog/entity/blog-category.entity';
import { BlogComment } from 'src/blog/entity/blog-comment.entity';
import { BlogPost } from 'src/blog/entity/blog-post.entity';

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
  controllers: [AuthController],
  providers: [AuthService]
})

export class AuthModule {}
