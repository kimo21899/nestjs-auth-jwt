import { Controller, Get, Logger, Query, UseGuards, Request, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';
import { RoleType } from 'src/common/guards/role-type';


@Controller('user')
export class UsersController {
  constructor(private userService: UserService){}

  // 프로필보기
  @Get('/profile')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_USER, RoleType.ROLE_ADMIN)
  getProfile(@Request() req) {    
    return req.user;
  }

  // 내정보
  @Get('/myinfo')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_USER, RoleType.ROLE_ADMIN)
  getMyinfo(@Request() req) {    
    return req.user;
  }
  
  // 정보수정
  @Post('/updateInfo')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_USER, RoleType.ROLE_ADMIN)
  async updateUserInfo(@Request() req) {    
    return await this.userService.updateUserInfo(req);
  }

}
