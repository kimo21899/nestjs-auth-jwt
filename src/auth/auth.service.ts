import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { CreateUserDTO, RegisterResponseDTO, UserDTO, UserListDTO } from './dto/user.dto';
import { LoginDTO, LoginResultDTO } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserAuthority } from 'src/users/entity/user_authority';
import { RoleType } from '../common/guards/role-type';
import { Payload } from './payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,    
    @InjectRepository(UserAuthority)
    private userAuthorityRepository: Repository<UserAuthority>,
    private jwtService: JwtService,
  ){}

  // 전체 유저목록 조회 
  async getUserList(page: number = 1, limit: number = 10): Promise<UserListDTO> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['authorities'],
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
    return this.userRepository.findOne({ where: { username }, relations: ['authorities'] });
  }

  // 회원등록 처리  
  async registerUser(createUserDTO: CreateUserDTO): Promise<RegisterResponseDTO> {
    try {
      // 추가 검증: authorities가 유효한지 확인
      if (!createUserDTO.authorities || createUserDTO.authorities.length === 0) {
        throw new BadRequestException('authorities는 비어 있을 수 없습니다.');
      }
      // role 입력값 검증
      const validAuthorities = Object.values(RoleType);
      const invalidAuthorities = createUserDTO.authorities.filter(
        auth => !validAuthorities.includes(auth),
      );
      if (invalidAuthorities.length > 0) {
        throw new BadRequestException(
          `입력 값이 올바르지 않습니다. 잘못된 값: ${invalidAuthorities.join(', ')}`,
        );
      }

      const existingUser = await this.findByUsername(createUserDTO.username);
      if (existingUser) {
        return {
          username: createUserDTO.username,
          result: 'ERROR',
          message: '이미 이용중인 회원 이름 입니다.',
        };
      }

      const user = this.userRepository.create({
        username: createUserDTO.username,
        password: createUserDTO.password, // @BeforeInsert에서 해싱
        email: createUserDTO.email,
      });

      const savedUser = await this.userRepository.save(user);

      const authorities = createUserDTO.authorities.map(auth =>
        this.userAuthorityRepository.create({
          userId: savedUser.id,
          userAuthority: auth,
          user: savedUser,
        }),
      );

      await this.userAuthorityRepository.save(authorities);

      return {
        username: savedUser.username,
        result: 'OK',
        message: '회원가입완료.',
      };
    } catch (error) {
      throw new InternalServerErrorException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }


  // 아이디로 기존 회원을 찾기 (가입시:아이디중복확인, 조회시: 회원정보조회)
  async loginUser(loginDTO: LoginDTO): Promise<LoginResultDTO> {
    try {
      const user = await this.userRepository.findOne({ where: { username: loginDTO.username }, relations: ['authorities'] });
      if (!user) {
        this.logger.warn(`User not found: ${loginDTO.username}`);
        return {
          username: loginDTO.username,
          result: 'ERROR',
          message: 'User not found',
        };
      }

      // 입력받은 password가 일치하는지 검사
      const isPasswordValid = await bcrypt.compare(loginDTO.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for username: ${loginDTO.username}`);
        return {
          username: loginDTO.username,
          result: 'ERROR',
          message: 'Invalid password for username',
        };
      }

      // 로그인 성공시 토큰발행
      const payload: Payload = {id:user.id, username: user.username, authorities: user.authorities.map(auth => auth.userAuthority) };
      const token = this.jwtService.sign(payload);
      const result = new LoginResultDTO(user);
      result.token = token; 
      result.result = "OK";
      result.message = "SUCCESS";
      this.logger.log(`Login successful for username: ${loginDTO.username}`);
      return result;
      
    } catch (error) {
      this.logger.error(`Login error for username: ${loginDTO.username}`, error.stack);
      throw new InternalServerErrorException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

}