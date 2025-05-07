import { Body, Controller, Get, Logger, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, RegisterResponseDTO, UserListDTO } from 'src/auth/dto/user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { LoginDTO, LoginResultDTO } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { RoleType } from '../common/guards/role-type';
import {v4 as uuidv4} from 'uuid';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);  
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '회원목록조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Get('/users')
  async userList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<UserListDTO> {
    this.logger.log(`Fetching user list: page=${page}, limit=${limit}`);
    return this.authService.getUserList(page, limit);
  }

  @ApiOperation({ summary: '회원등록' })
  @Post('/register') 
  async registerAccount(@Body() createUserDTO: CreateUserDTO): Promise<RegisterResponseDTO> {
    // this.logger.log(`Registering user: ${createUserDTO.username}`);
    return this.authService.registerUser(createUserDTO);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('/login') 
  async loginAccount(@Body() loginDTO: LoginDTO): Promise<LoginResultDTO> {
    return this.authService.loginUser(loginDTO);
  }

  @ApiOperation({ summary: '회원프로필' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN, RoleType.ROLE_USER)
  @Get('/profile')
  getProfile(@Request() req) {    
    return req.user;
  }

  @Get('uuid')
  getUUID(): string {
    return uuidv4();
  }


}
