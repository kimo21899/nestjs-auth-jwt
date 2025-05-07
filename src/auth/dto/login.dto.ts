import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";
import { User } from "src/users/entity/user.entity";
import { RoleType } from "../../common/guards/role-type";

export class LoginDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}

export class LoginResultDTO {
  id?: number;
  token?: string;
  authorities?: RoleType[];  
  username: string;
  result: 'OK' | 'ERROR';
  message: string;
  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.authorities = user.authorities.map(auth => auth.userAuthority);
    this.result = "ERROR";
    this.message = "대기"
  }
}