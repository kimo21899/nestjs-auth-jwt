import { IsString, IsEmail, MinLength, IsEnum, IsArray, MaxLength, IsNumber, Matches, IsBoolean } from 'class-validator';
import { User } from 'src/users/entity/user.entity';
import { RoleType } from '../../common/guards/role-type';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorator/is-not-empty-string.decorator';
import { ResultType } from 'src/common/result-type';

// 카테고리목록
export class BlogCategory {
  id: number;
  name: string;
  description: string;
  topImage: string;
  listImage: string;
  sortOrder: number;
  posts: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

// 카테고리 등록
export class CreateBlogCategory {
  @ApiProperty({ description: '카테고리명', example: '카테고리명' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  name: string;

  @ApiProperty({ description: '설명', example: '설명' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  description: string;

  @ApiProperty({ description: '상단이미지주소', example: '' })
  @IsString()
  @MaxLength(255)
  topImage?: string;

  @ApiProperty({ description: '목록이미지주소', example: '' })
  @IsString()
  @MaxLength(255)
  listImage?: string;

  @ApiProperty({ description: '공개여부', example: true })
  @IsBoolean()
  isPublic: boolean;
}

// 카테고리 수정
export class UpdateBlogCategory { 
  @ApiProperty({ description: '카테고리 ID', example: 0 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '카테고리명', example: '카테고리명' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  name: string;

  @ApiProperty({ description: '설명', example: '설명' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  description: string;

  @ApiProperty({ description: '상단이미지주소', example: '' })
  @IsString()
  @MaxLength(255)
  topImage?: string;

  @ApiProperty({ description: '목록이미지주소', example: '' })
  @IsString()
  @MaxLength(255)
  listImage?: string;

  @ApiProperty({ description: '정렬순서', example: 1 })
  @IsNumber()  
  sortOrder: number;

  @ApiProperty({ description: '공개여부', example: true })
  @IsBoolean()
  isPublic: boolean; 
}