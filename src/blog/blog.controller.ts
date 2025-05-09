import { Body, Controller, Get, Logger, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from 'src/common/decorator/roles.decorator';
import { RoleType } from 'src/common/guards/role-type';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User } from 'src/users/entity/user.entity';
import { BlogService } from './blog.service';
import { Repository } from 'typeorm';
import { BlogCategory } from './entity/blog-category.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateBlogCategory, UpdateBlogCategory } from './dto/blog.category.dto';
import { ResultDTO } from 'src/auth/dto/login.dto';
import { BaseResponseDto, ResultResponseDto } from 'src/common/dto/response.dto';
import { paginatedResponse, successResponse } from 'src/common/utils/response.util';

@Controller('blog')
@ApiTags('Blog') // 컨트롤러에 대한 태그 설정 (Swagger UI 그룹화)
export class BlogController {
  private readonly logger = new Logger(BlogController.name);  

constructor(
    private blogService: BlogService,   
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // 카테고리 목록
  @ApiOperation({ summary: '카테고리 목록', description: '카테고리 목록' })
  @ApiCreatedResponse({ description: '카테고리 목록'})
  @ApiResponse({
    status: 200,
    description: '성공 응답',
    // type: [BlogCategory],
  })  
  @UseGuards(AuthGuard)
  @Get('/categorys')
  async getCategoryList()  {
    // const results = this.blogService.getCategoryList();
    return this.blogService.getCategoryList();   
  }

  // 카테고리 등록
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '카테고리 등록', description: '카테고리 등록' })
  @ApiCreatedResponse({ description: '카테고리 등록', type: CreateBlogCategory })
  @ApiResponse({
    status: 200,
    description: '성공 응답',
    type: ResultResponseDto,
  })  
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Post('/category')
  async createCategory(@Body() senData: CreateBlogCategory): Promise<ResultResponseDto> {
    return this.blogService.createCategory(senData);
  }
  
  // 카테고리 정보조회 (GET /:id)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '카테고리 정보조회', description: '카테고리 정보조회' })
  @ApiCreatedResponse({ description: '카테고리 정보조회' })
  @UseGuards(AuthGuard)
  @Get('/category/:id')
  async getCategoryInfo(@Param('id') id: number) {   
    return await this.blogService.getCategoryInfo(id);
  }

  // 카테고리 수정
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '카테고리 정보수정', description: '카테고리 정보수정' })
  @ApiCreatedResponse({ description: '카테고리 정보수정', type: UpdateBlogCategory })
  @ApiResponse({
    status: 200,
    description: '성공 응답',
    type: ResultResponseDto,
  })  
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ROLE_ADMIN)
  @Put('/category')
  async updateCategory( @Body() reqestData: UpdateBlogCategory) {
    return this.blogService.updateCategory(reqestData);
  }

}
