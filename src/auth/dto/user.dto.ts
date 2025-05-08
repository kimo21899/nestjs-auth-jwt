import { IsString, IsEmail, MinLength, IsEnum, IsArray, MaxLength, IsNumber, Matches } from 'class-validator';
import { User } from 'src/users/entity/user.entity';
import { RoleType } from '../../common/guards/role-type';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorator/is-not-empty-string.decorator';
import { ResultType } from 'src/common/result-type';

//서버내에서 회원정보를 다룰때 사용
export class UserDTO {
  id: number;
  username: string;
  nickname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  authority: RoleType;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.authority = user.authority;
  }
}

// 유저목록 리스트
export class UserListDTO {
  users: UserDTO[];
  total: number;
  page: number;
  limit: number;
}

// 클라이언트에 유저정보를 제공할때 사용
export class UserResponseDTO {
  id: number;
  username: string;
  nickname: string;
  email: string;
  constructor(partial: Partial<UserResponseDTO>) {
    Object.assign(this, partial);
  }
}

export class CreateUserDTO {
  @ApiProperty({ description: '아이디', example: 'userid' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '비밀번호', example: 'password' })
  @IsNotEmptyString(6, 20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{6,20}$/, {
    message: '비밀번호는 문자, 숫자, 특수문자(@, $, !, %, *, ?, &, .)의 조합으로 6자 이상 20자 이하로 입력해주세요 ',
  })
  password: string;

  @ApiProperty({ description: '닉네임', example: 'nickname' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  nickname: string;

  @ApiProperty({ description: '이메일', example: 'userid@user.com' })
  @IsEmail()
  @MaxLength(50)
  email: string;

  // @IsEnum(RoleType, { each: true, message: 'authority는 지정된 값만 허용됩니다.' })
  // authority: RoleType;
}

export class RegisterResponseDTO {
  username: string;
  nickname: string;
  result: ResultType;
  message: string;
}

// 회원정보수정 (이메일, 권한수정)
export class UpdateUserDTO {
  @ApiProperty({ description: '아이디', example: 'userid' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '닉네임', example: 'nickname' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  nickname: string;

  @ApiProperty({ description: '이메일', example: 'userid@user.com' })
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsEnum(RoleType, { each: true, message: 'authority는 지정된 값만 허용됩니다.' })
  authority: RoleType;
}