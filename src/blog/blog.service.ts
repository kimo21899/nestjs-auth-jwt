import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { Repository, DataSource } from 'typeorm';
import { BlogCategory } from './entity/blog-category.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateBlogCategory, UpdateBlogCategory } from './dto/blog.category.dto';
import { ResultDTO } from 'src/auth/dto/login.dto';
import { ResultType } from 'src/common/result-type';
import { send } from 'process';
import { ResultResponseDto } from 'src/common/dto/response.dto';


@Injectable()
export class BlogService {

  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogCategory)
    private blogCategoryRepository: Repository<BlogCategory>,

    private dataSource: DataSource,  // ✅ DataSource 주입
  ) {}

  // 카테고리 목록
  async getCategoryList() {
    // return await this.blogCategoryRepository.find();
    const results = await this.dataSource
      .getRepository(BlogCategory)
      .createQueryBuilder('blog_category')
      .orderBy('sortOrder', 'ASC')
      .getMany();  
    return {
      "result": true,
      "message": "카테고리 조회성공",
      "error": null,
      "data": results
    }
  }

  // 카테고리 정보조회
  async getCategoryInfo(id: number) {
    const category = await this.blogCategoryRepository.findOne({ where: { id } });    
    if (!category) {
      return {
        result: false,
        message:"정보조회오류", 
        error: { code: "1001", details: "존재하지 않는 카테고리 ID입니다"}
      };
    }
    return category;
  }

  // 카테고리 등록
  async createCategory(newCategory: CreateBlogCategory): Promise<ResultResponseDto> {
    // 카테고리 신규순서
    const newSortOrder = await this.findCastegorySortOrder();
    // 입력된 카테고리 정보+정렬순서(제일뒤로)
    await this.blogCategoryRepository.save({...newCategory, sortOrder: newSortOrder});
    // this.logger.log(`BlogCategory with Name ${newCategory.name}, Order ${newSortOrder} created successfully`, 'BlogService');
    return {
      result: true,
      message:"카테고리 등록완료", 
      error: null
    };

  }

  // 카테고리 수정
  async updateCategory(reqestData: UpdateBlogCategory): Promise<ResultResponseDto> {
    // 기존 데이터 조회
    const beforeInfo = await this.blogCategoryRepository.findOne({ where: { id: reqestData.id } });    
    if(!beforeInfo) {
      return {
        result: false,
        message:"수정오류", 
        error: { code: "1001", details: "존재하지 않는 카테고리 ID입니다"}
      };
    }
    // 정보수정
    await this.blogCategoryRepository.save(reqestData);    
    this.logger.log(`BlogCategory ${reqestData.name} updated successfully`, 'BlogService');
    return {
      result: true,
      message:"수정완료", 
      error: null
    };
  }

  // 신규 카테고리 정렬순서 (제일 마지막번호 +1)
  async findCastegorySortOrder() : Promise<number> {
    const maxSortOrder = await this.dataSource
      .getRepository(BlogCategory)
      .createQueryBuilder('blog_category')
      .select('MAX(blog_category.sortOrder)', 'max')
      .getRawOne();  
    return maxSortOrder.max ? maxSortOrder.max+1 : 1;
  }
  
}
