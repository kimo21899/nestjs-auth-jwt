import { BadRequestException, Body, Injectable, InternalServerErrorException, Logger, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO, RegisterResponseDTO, UpdateUserDTO, UserDTO, UserListDTO, UserResponseDTO } from './dto/user.dto';
import { LoginDTO, LoginResultDTO, ResultDTO} from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '../common/guards/role-type';
import { Payload } from './payload.interface';
import { ResultType } from 'src/common/result-type';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { UserLoginlog } from 'src/users/entity/user.loginlog';
import { Request, Response } from 'express';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,    
    @InjectRepository(UserLoginlog)
    private userLoginLogRepository: Repository<UserLoginlog>,
    private jwtService: JwtService,
  ){}

  // 전체 유저목록 조회 
  async getUserList(page: number = 1, limit: number = 10): Promise<UserListDTO> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      users: users.map(user => new UserDTO(user)),
      total,
      page,
      limit,
    };
  }

  // 아이디로 기존 회원을 찾기 (가입시:아이디중복확인, 조회시: 회원정보조회)
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  // 회원등록 처리  
  async registerUser(createUserDTO: CreateUserDTO): Promise<RegisterResponseDTO> {
    try {
      // username 중복확인
      const existingUserName = await this.findByUsername(createUserDTO.username);
      if (existingUserName) {
        return {
          username: createUserDTO.username,
          nickname: createUserDTO.nickname,
          result: ResultType.ERROR,
          message: '이미 이용중인 아이디 입니다.',
        };
      }
      // nickname 중복확인
      const existingNickName = await this.userRepository.findOne({ where: { nickname: createUserDTO.nickname } });
      if (existingNickName) {
        return {
          username: createUserDTO.username,
          nickname: createUserDTO.nickname,
          result: ResultType.ERROR,
          message: '이미 이용중인 닉네임 입니다.',
        };
      }

      // user entity 데이터 입력
      const user = this.userRepository.create({
        username: createUserDTO.username,
        nickname: createUserDTO.nickname,
        password: createUserDTO.password, // @BeforeInsert에서 해싱
        email: createUserDTO.email,        
        authority: RoleType.ROLE_USER,
      });

      // 회원 DB 등록(INSERT)
      const savedUser = await this.userRepository.save(user);
      
      return {
        username: createUserDTO.username,
        nickname: createUserDTO.nickname,
        result: ResultType.SUCCESS,
        message: '회원가입완료.',
      };

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }


  // 아이디로 기존 회원을 찾기 (가입시:아이디중복확인, 조회시: 회원정보조회)
  async login(
    @Body() loginDTO: LoginDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ): Promise<LoginResultDTO> {
    try {
      const connUrl = req.headers.referer;;
      const username = loginDTO.username;
      const password = loginDTO.password;

      const user = await this.userRepository.findOne({ where: { username: username } });
      if (!user) {
        this.logger.warn(`User not found: ${loginDTO.username}`);        
        return {
          username: username,
          result: ResultType.ERROR,
          message: 'User not found',
        };
      }

      // 입력받은 password가 일치하는지 검사
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for username: ${username}`);       
        return {
          username: username,
          result: ResultType.ERROR,
          message: 'Invalid password for username',
        };
      }

      // 유저의 loginkey 수정 (DB 보안)
      const loginkey = uuidv4();
      user.loginkey= loginkey;

      // 유저정보저장, 로그인로그 저장
      await this.userRepository.save(user);
      await this.userLoginLogRepository.save({username: user.username, loginkey: loginkey, connectUrl: connUrl, loginResult: ResultType.SUCCESS});

      // 로그인 성공시 토큰발행      
      const payload: Payload = {id:user.id, username: user.username, nickname: user.nickname, email: user.email, loginkey: loginkey, authority: user.authority };
 
      // const token = this.jwtService.sign(payload);
      const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1d' });
      
      this.logger.log(`Login successful for username: ${loginDTO.username}`);
      
      // 쿠키밠발행
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 30, // 30분
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 24시간
      });

      return {
        username: username,
        result: ResultType.SUCCESS,
        message: '로그인성공'
      } 

    } catch (error) {
      this.logger.error(`Login error for username: ${loginDTO.username}`, error.stack);
      throw new InternalServerErrorException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // 프로필조회 (로그인정보)
  getProfile(@Req() req: Request): UserResponseDTO {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    } else {
      const { id, username, nickname, email } = req.user as User;
      return new UserResponseDTO({ id, username, nickname, email });  
    }  
  }


  // (/api/users/:id) 회원정보조회 
  async getUserInfo(username: string): Promise<UserDTO> {
    const user = await this.userRepository.findOne({ where: { username } });    
    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      throw new InternalServerErrorException('일치하는 회원이 없습니다.');
    }
    // console.log(user);
    // Entity 를 DTO로 변환해서 리턴
    return new UserDTO(user);
  }

  // 회원정보수정
  async updateUserInfo(updateUserDto: UpdateUserDTO): Promise<ResultDTO> {   
    console.log('updateUserInfo', updateUserDto);

    const userName = updateUserDto.username;

    let user: User | null = null; // Initialize user as null

    try {
      user = await this.userRepository.findOne({ where: { username: userName }});
      if (!user) {
        throw new Error(`User with ID ${userName} not found`);
      }

      console.log("user===", user);

      // 1_1. user.id 와 username 이 같은지 확인
      // Assuming updateUserDto also has a username property for this check
      if (userName && userName !== user.username) {
        throw new Error(`username 값이 올바르지 않습니다.`);
      }

      // 1_2. authority 수정
      user.authority = updateUserDto.authority;

      // 1_3. 이메일 정보 업데이트 (email이 있다면)
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        user.email = updateUserDto.email;        
        await this.userRepository.save(user); // Save the updated email
      }

      // 3. 성공.
      this.logger.log(`User with ID ${user.username} updated successfully`, 'AuthService');
      return {
        "error":0,
        "result": ResultType.SUCCESS,
        "message": "정보수정완료"
      }

    } catch (error) {
      this.logger.error(`Error updating user with ID ${userName}: ${error.message}`, 'AuthService');
      return {
        "error":1,
        "result": ResultType.ERROR,
        "message": error.message
      }
    }
  }

  // 회원삭제
  async removeUserInfo(username: string): Promise<ResultDTO> {
    const user = await this.userRepository.findOne({ where: { username: username }});
    if(!user) {
      return {
        "error":1,
        "message":"아이디를 찾을 수 없습니다",
        "result": ResultType.ERROR,
      };
    }

    await this.userRepository.delete({ id: user.id });
    // this.logger.log(`User with UserName ${username} deleted successfully`, 'AuthService');  

    return {
      "error":0,
      "message":"회원삭제완료",
      "result": ResultType.SUCCESS,
    };
  }

}