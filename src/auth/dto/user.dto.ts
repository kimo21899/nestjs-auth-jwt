import { IsString, IsEmail, MinLength, IsEnum, ArrayNotEmpty, IsArray, MaxLength, IsNumber } from 'class-validator';
import { User } from 'src/users/entity/user.entity';
import { RoleType } from '../../common/guards/role-type';


export class UserDTO {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  authorities: RoleType[];

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.authorities = user.authorities.map(auth => auth.userAuthority);
  }
}

export class UserListDTO {
  users: UserDTO[];
  total: number;
  page: number;
  limit: number;
}

export class CreateUserDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'authorities는 비어 있을 수 없습니다.' })
  @IsEnum(RoleType, { each: true, message: 'authorities는 지정된 값만 허용됩니다.' })
  authorities: RoleType[];
}

export class RegisterResponseDTO {
  username: string;
  // email: string;
  // authorities: UserAuthorityType[];
  result: 'OK' | 'ERROR';
  message: string;
}


// 회원정보수정 (이메일, 권한수정)
export class UpdateUserDTO {
  @IsNumber()
  id?: number;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsArray()
  @IsEnum(RoleType, { each: true, message: 'authorities는 지정된 값만 허용됩니다.' })
  authorities?: RoleType[];
}

// 수정/삭제/등록 결과응답
export class ResultDTO {
  error: number;
  result: 'OK' | 'ERROR';
  message: string;
}
