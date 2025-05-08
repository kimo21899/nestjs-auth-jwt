import { Injectable, Request } from '@nestjs/common';
import { User } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultType } from 'src/common/result-type';
import { ResultDTO } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,    
  ){}

  // 회원정보 수정 (이메일, 권한)
  async updateUserInfo(req): Promise<ResultDTO> {
    console.log(req.user);
    console.log(req.body);
    return {
      "error":0, 
      "result": ResultType.SUCCESS,
      "message":"완료"
    }
  }

}
