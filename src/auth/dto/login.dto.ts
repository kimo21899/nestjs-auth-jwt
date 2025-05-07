import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { RoleType } from "../../common/guards/role-type";

export class LoginDTO {
  @IsString()
  @MaxLength(20)
  username: string;

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
  result: 'OK' | 'ERROR';
  message: string;
  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.nickname = user.nickname;
    this.authorities = user.authorities.map(auth => auth.userAuthority);
    this.result = "ERROR";
    this.message = "대기"
  }
}