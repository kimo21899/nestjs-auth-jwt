import { Body, Controller, Get, Logger, Post, Query, UseGuards, Request, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, RegisterResponseDTO, ResultDTO, UpdateUserDTO, UserDTO, UserListDTO } from 'src/auth/dto/user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { LoginDTO, LoginResultDTO } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { RoleType } from '../common/guards/role-type';
import {v4 as uuidv4} from 'uuid';

@Controller('api')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);  
  constructor(private authService: AuthService) {}

  // 회원목록
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

  // 회원등록
  @ApiOperation({ summary: '회원등록' })
  @Post('/register') 
  async registerAccount(@Body() createUserDTO: CreateUserDTO): Promise<RegisterResponseDTO> {
    return this.authService.registerUser(createUserDTO);
  }

  // 회원인증(로그인)
  @ApiOperation({ summary: '로그인' })
  @Post('/login') 
  async loginAccount(@Body() loginDTO: LoginDTO): Promise<LoginResultDTO> {
    return this.authService.loginUser(loginDTO);
  }

  // 회원프로필
  @ApiOperation({ summary: '회원프로필' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN, RoleType.ROLE_USER)
  @Get('/profile')
  getProfile(@Request() req) {    
    return req.user;
  }

  // 회원정보조회 (GET /:id)
  @ApiOperation({ summary: '회원정보조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Get('/user/:id')
  async userInfo(@Param('id') id: number): Promise<UserDTO> {
    this.logger.log(`getUserInfo id= ${id}`);
    return this.authService.getUserInfo(id);
  }

  // 회원정보수정
  @ApiOperation({ summary: '회원정보수정' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Put('/user/update')
  updateUserInfo(@Body() updateUserDto: UpdateUserDTO): Promise<ResultDTO> {
    this.logger.log(`update username : ${updateUserDto.username}`, 'AuthController');
    return this.authService.updateUserInfo(updateUserDto);
  }

  // 회원정보삭제
  @ApiOperation({ summary: '회원삭제' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Delete('/user/delete/:id')
  removeUserInfo(@Param('id') username: string): Promise<ResultDTO> {
    this.logger.log(`delete username : ${username}`, 'AuthController');
    return this.authService.removeUserInfo(username);
  }


  @Get('uuid')
  getUUID(): string {
    return uuidv4();
  }


}
