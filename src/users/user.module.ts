import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserAuthority } from './entity/user_authority';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
     TypeOrmModule.forFeature([User, UserAuthority]),
     JwtModule.registerAsync({
       imports: [ConfigModule],
       useFactory: async (configService: ConfigService) => ({
        //secret: configService.get<string>('JWT_SECRET', 'default-secret'), // 환경 변수 사용
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
       }),
       inject: [ConfigService],
     }),    
   ],
  controllers: [UsersController],
  providers: [UserService]
})

export class UserModule {
  
}
