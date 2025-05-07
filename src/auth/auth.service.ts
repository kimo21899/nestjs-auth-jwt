import { BadRequestException, Injectable, InternalServerErrorException, Logger, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { CreateUserDTO, RegisterResponseDTO, ResultDTO, UpdateUserDTO, UserDTO, UserListDTO } from './dto/user.dto';
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
      // username 중복확인
      const existingUserName = await this.findByUsername(createUserDTO.username);
      if (existingUserName) {
        return {
          username: createUserDTO.username,
          nickname: createUserDTO.nickname,
          result: 'ERROR',
          message: '이미 이용중인 아이디 입니다.',
        };
      }
      // nickname 중복확인
      const existingNickName = await this.userRepository.findOne({ where: { nickname: createUserDTO.nickname } });
      if (existingNickName) {
        return {
          username: createUserDTO.username,
          nickname: createUserDTO.nickname,
          result: 'ERROR',
          message: '이미 이용중인 닉네임 입니다.',
        };
      }

      // user entity 데이터 입력
      const user = this.userRepository.create({
        username: createUserDTO.username,
        nickname: createUserDTO.nickname,
        password: createUserDTO.password, // @BeforeInsert에서 해싱
        email: createUserDTO.email,
      });

      // 회원 DB 등록(INSERT)
      const savedUser = await this.userRepository.save(user);

      // 회원권한 배열생성 (RoleType[])
      const authorities = createUserDTO.authorities.map(auth =>
        this.userAuthorityRepository.create({
          userId: savedUser.id,
          userAuthority: auth,
          user: savedUser,
        }),
      );

      //  회원권한 DB등록
      await this.userAuthorityRepository.save(authorities);

      return {
        username: createUserDTO.username,
        nickname: createUserDTO.nickname,
        result: 'OK',
        message: '회원가입완료.',
      };

    } catch (error) {
      throw new InternalServerErrorException(error);
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
          nickname: "",
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
          nickname: "",
          result: 'ERROR',
          message: 'Invalid password for username',
        };
      }

      // 로그인 성공시 토큰발행
      const payload: Payload = {id:user.id, username: user.username, nickname: user.nickname, authorities: user.authorities.map(auth => auth.userAuthority) };
      const token = this.jwtService.sign(payload);
      const result = new LoginResultDTO(user);
      result.token = token;
      result.nickname = user.nickname; 
      result.result = "OK";
      result.message = "SUCCESS";
      this.logger.log(`Login successful for username: ${loginDTO.username}`);
      return result;
      
    } catch (error) {
      this.logger.error(`Login error for username: ${loginDTO.username}`, error.stack);
      throw new InternalServerErrorException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  // (/api/users/:id) 회원정보조회 
  async getUserInfo(id: number): Promise<UserDTO> {
    const user = await this.userRepository.findOne({
      where: { id }, 
      relations: ['authorities'], // 이걸 넣어야 조인테이블의 데이터를 받아 올 수 있다.
    });
    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new InternalServerErrorException('일치하는 회원이 없습니다.');
    }
    // console.log(user);
    // Entity 를 DTO로 변환해서 리턴
    return new UserDTO(user);
  }

  // 회원정보수정
  async updateUserInfo(updateUserDto: UpdateUserDTO): Promise<ResultDTO> {   
    const userId = updateUserDto.id;
    const userName = updateUserDto.username;
    let user: User | null = null; // Initialize user as null

    try {
      user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['authorities'], // 이걸 넣어야 조인테이블의 데이터를 받아 올 수 있다.
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // 1_1. user.id 와 username 이 같은지 확인
      // Assuming updateUserDto also has a username property for this check
      if (userName && userName !== user.username) {
        throw new Error(`username 값이 올바르지 않습니다.`);
      }

      // 1_2. 이메일 정보 업데이트 (email이 있다면)
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        user.email = updateUserDto.email;
        await this.userRepository.save(user); // Save the updated email
        this.logger.log(`User with username ${userName} email updated to: ${updateUserDto.email}`, 'AuthService');
      }

      // 2. 기존 authorities 삭제
      await this.userAuthorityRepository.delete({ user: { id: user.id } });

      // 3. 새로운 authorities 저장
      if (updateUserDto.authorities && updateUserDto.authorities?.length > 0) {
        const authorities: RoleType[] = updateUserDto.authorities;
        for (const roleType of authorities) {
          const newUserAuthority = this.userAuthorityRepository.create({
            user: { id: user.id },
            userAuthority: roleType,
            userId: user.id,
          });
          await this.userAuthorityRepository.save(newUserAuthority);
        }
      }

      // 4. 성공.
      this.logger.log(`User with ID ${user.username} updated successfully`, 'AuthService');

      const result = new ResultDTO();
      result.error = 0;
      result.result = 'OK';
      result.message = `${user.username} 정보수정완료`;
      return result;

    } catch (error) {
      this.logger.error(`Error updating user with ID ${userId}: ${error.message}`, 'AuthService');
      const result = new ResultDTO();
      result.error = 1;
      result.result = 'ERROR';
      result.message = `회원 정보 수정 실패: ${error.message}`;
      return result;
    }
  }

  // 회원삭제
  async removeUserInfo(username: string): Promise<ResultDTO> {
    console.log(username);
    const user = await this.userRepository.findOne({
      where: { username: username }, 
      relations: ['authorities'], // 이걸 넣어야 조인테이블의 데이터를 받아 올 수 있다.
    });
    if(!user) {
      throw new Error(`user with username ${username} not found`);
    }

    // 삭제할때는 user.id 를 기준으로 삭제 (외래키 테이블도 함께 삭제위해)
    await this.userAuthorityRepository.delete({ user: { id: user.id } });
    await this.userRepository.delete({ id: user.id });
    this.logger.log(`User with UserName ${username} deleted successfully`, 'AuthService');  

    let result = new ResultDTO();
    result.error=0;
    result.result="OK";
    result.message=`${username} 회원삭제완료`;
    return result;
  }
}