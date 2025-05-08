import { IsEnum, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ResultType } from "src/common/result-type";

// 로그인요청
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

// 로그인로그
export class LoginLogDTO {   
    username: string;
    loginkey: string;
    loginResult: ResultType;
    connectUrl: string;    
}

// 로그인 결과
export class LoginResultDTO {
  username: string;
  result: ResultType;
  message: string;  
}

// 결과응답
export class ResultDTO {
  error: number;
  result: ResultType;
  message: string;
}
