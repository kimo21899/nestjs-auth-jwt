import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction  } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService, // Inject ConfigService directly
    private authService: AuthService // 회원인증 서비스스
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    // const token = this.extractTokenFromHeader(request); // header에서 token 읽기
    const token = this.extractTokenFromRequest(request);  // cookie에서 token 읽기
    if (!token) {
      console.log("token 없음");;
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      );

      // console.log('payload==', payload.username);

      // jwt username으로 유저검색
      const user = await this.authService.findByUsername(payload.username);
      if (!user) {
        console.log("user not found");
        throw new UnauthorizedException('Invalid session');
      }

      // console.log('user==',user);
      
      if(user.loginkey !== payload.loginkey) {        
        // console.log(user.loginkey , payload.loginkey);
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        throw new UnauthorizedException('Invalid session');
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      
      // console.log(user);

      request['user'] = payload;
    } catch {
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
      throw new UnauthorizedException('Token invalid or expired');
    }    
    return true;
  }

  // 헤더에서 읽어오기
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  // 쿠키에서 읽어오기
  private extractTokenFromRequest(request: Request): string | undefined {
    // console.log(request.cookies.accessToken);
    return request.cookies.accessToken;
  }
}
