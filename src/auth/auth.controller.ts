import { Body, Controller, Get, Logger, Post, Query, UseGuards, Param, Put, Delete, Res, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO, RegisterResponseDTO, UpdateUserDTO, UserDTO, UserListDTO, UserResponseDTO } from 'src/auth/dto/user.dto';
import { LoginDTO, LoginResultDTO, ResultDTO } from './dto/login.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleType } from '../common/guards/role-type';
import {v4 as uuidv4} from 'uuid';
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Request, Response } from 'express';
import { User } from 'src/users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResponseDto, PagingResponseDto, ResultResponseDto } from 'src/common/dto/response.dto';
import { paginatedResponse, successResponse } from 'src/common/utils/response.util';


@Controller('auth')
@ApiTags('Auth') // 컨트롤러에 대한 태그 설정 (Swagger UI 그룹화)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);  
  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}


  // 회원인증(로그인)
  @ApiOperation({ summary: '회원인증', description: '회원인증.' })
  @ApiResponse({
    status: 200,
    description: '성공 응답',
    type: ResultResponseDto,
  })  
  @Post('/login') 
  async loginAccount(
      @Body() loginDTO: LoginDTO,  
      @Res({ passthrough: true }) res: Response,
      @Req() req: Request
    ) : Promise<ResultResponseDto> {
    return await this.authService.login(loginDTO, res, req);
  }

  // 회원목록
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '회원목록조회', description: '전체 회원목록을 조회합니다. ADMIN권한이 필요합니다.' })
  @ApiResponse({
    status: 200,
    description: '성공 응답',
    type: UserListDTO,
  })  
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Get('/users')
  async userList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    this.logger.log(`Fetching user list: page=${page}, limit=${limit}`);
    const results = await this.authService.getUserList(page, limit);
    if(results.users) {
      return paginatedResponse(results.users, results.total, results.page, results.limit, 'SUCCESS');
    } 
  }

  // 회원등록
  @ApiOperation({ summary: '회원등록', description: '신규 회원을 추가합니다.' })
  @ApiCreatedResponse({ description: '회원 등록 성공', type: ResultResponseDto })
  @Post('/register') 
  async registerAccount(@Body() createUserDTO: CreateUserDTO): Promise<ResultResponseDto> {
    return this.authService.registerUser(createUserDTO);
  }

  // 회원프로필
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '회원프로필' })
  @ApiCreatedResponse({ description: '프로필조회', type: UserResponseDTO })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN, RoleType.ROLE_USER)
  @Get('/profile')
  getProfile(@Req() req: Request) {    
    if (!req.user) {
      return {
        result: false,
        message:"UnauthorizedException", 
        error: { code: "10001", details: "로그인 후 이용해 주세요"}
      };
    } else {      
      const { id, username, nickname, email } = req.user as User;
      return new UserResponseDTO({ id, username, nickname, email });       
    }
  }

  // 회원정보조회 (GET /:id)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '회원정보조회' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Get('/user/:username')
  async userInfo(@Param('username') username: string): Promise<UserDTO> {
    // this.logger.log(`getUserInfo id= ${username}`);
    return this.authService.getUserInfo(username);
  }

  // 회원정보수정
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '회원정보수정' })
  @ApiCreatedResponse({ description: '회원정보수정', type: ResultResponseDto })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Put('/user/update')
  updateUserInfo(@Body() updateUserDto: UpdateUserDTO): Promise<ResultResponseDto> {
    // this.logger.log(`update username : ${updateUserDto.username}`, 'AuthController');
    return this.authService.updateUserInfo(updateUserDto);
  }

  // 회원정보삭제
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '회원삭제' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Delete('/user/delete/:username')
  removeUserInfo(@Param('username') username: string) {
    return this.authService.removeUserInfo(username);
  }

  // 로그아웃
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_USER, RoleType.ROLE_ADMIN)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<ResultResponseDto> {
    const user = req.user as User;
    await this.userRepository.update(user.id, { loginkey: "" }); // 세션 무효화
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');    
    // return res.json({ message: '로그아웃 완료' });
    return {
      result: true,
      message:"로그아웃 되었습니다",
      error: null 
    };

  }

  // GET UUID (TEST) 
  @Get('uuid')
  getUUID() {
    return successResponse(uuidv4());
  }

}