import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { UserAuthority } from 'src/users/entity/user_authority';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAuthority]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'), // 환경 변수 사용
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),    
  ],
  controllers: [AuthController],
  providers: [AuthService]
})

export class AuthModule {}
