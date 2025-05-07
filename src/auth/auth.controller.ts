import { Body, Controller, Get, Logger, Post, Query, UseGuards, Request, Param, Put, Delete, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, RegisterResponseDTO, ResultDTO, UpdateUserDTO, UserDTO, UserListDTO } from 'src/auth/dto/user.dto';
import { LoginDTO, LoginResultDTO } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleType } from '../common/guards/role-type';
import {v4 as uuidv4} from 'uuid';
import { ApiTags, ApiOperation, ApiResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiBearerAuth   
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Response } from 'express';


@Controller('api')
@ApiTags('Api') // 컨트롤러에 대한 태그 설정 (Swagger UI 그룹화)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);  
  constructor(private authService: AuthService) {}

  // 회원인증(로그인)
  @ApiOperation({ summary: '회원인증', description: '회원인증.' })
  @ApiCreatedResponse({ description: '회원인증 성공', type: LoginResultDTO })
  @ApiBadRequestResponse({ description: '회원인증 실패', type: LoginResultDTO })
  @Post('/login') 
  async loginAccount(
      @Body() loginDTO: LoginDTO,  
      @Res({ passthrough: true }) res: Response
    ): Promise<LoginResultDTO> {
    return this.authService.loginUser(loginDTO, res);
  }

  // 회원목록
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원목록조회', description: '전체 회원목록을 조회합니다. ADMIN권한이 필요합니다.' })
  @ApiCreatedResponse({ description: '회원목록조회', type: UserListDTO })
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
  @ApiOperation({ summary: '회원등록', description: '신규 회원을 추가합니다.' })
  @ApiCreatedResponse({ description: '회원 등록 성공', type: RegisterResponseDTO })
  @Post('/register') 
  async registerAccount(@Body() createUserDTO: CreateUserDTO): Promise<RegisterResponseDTO> {
    return this.authService.registerUser(createUserDTO);
  }

  // 회원프로필
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원프로필' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN, RoleType.ROLE_USER)
  @Get('/profile')
  getProfile(@Request() req) {    
    return req.user;
  }

  // 회원정보조회 (GET /:id)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원정보조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Get('/user/:username')
  async userInfo(@Param('username') username: string): Promise<UserDTO> {
    this.logger.log(`getUserInfo id= ${username}`);
    return this.authService.getUserInfo(username);
  }

  // 회원정보수정
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원정보수정' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Put('/user/update')
  updateUserInfo(@Body() updateUserDto: UpdateUserDTO): Promise<ResultDTO> {
    this.logger.log(`update username : ${updateUserDto.username}`, 'AuthController');
    return this.authService.updateUserInfo(updateUserDto);
  }

  // 회원정보삭제
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원삭제' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Delete('/user/delete/:id')
  removeUserInfo(@Param('id') username: string): Promise<ResultDTO> {
    this.logger.log(`delete username : ${username}`, 'AuthController');
    return this.authService.removeUserInfo(username);
  }

  // GET UUID (TEST)
  @Get('uuid')
  getUUID(): string {
    return uuidv4();
  }

}