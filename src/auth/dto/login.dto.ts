import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { RoleType } from "../../common/guards/role-type";
import { ApiProperty } from "@nestjs/swagger";
import { ResultType } from "src/common/result-type";

export class LoginDTO {
  @ApiProperty({ description: '아이디', example: 'userid' })
  @IsString()
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '비밀번호호', example: 'password' })
  @IsString()
  @MaxLength(20)
  password: string;
}

export class LoginResultDTO {
  id?: number;
  token?: string;
  authorities?: RoleType[];  
  username: string;
  nickname: string;
  loginkey: number;
  result: ResultType;
  message: string;
  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.authorities = user.authorities.map(auth => auth.userAuthority);
    this.result = ResultType.ERROR
    this.message = "대기"
  }
}

export class LoginLogDTO {   
    username: string;
    loginkey: number;
    loginResult: ResultType;
}