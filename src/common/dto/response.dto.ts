// common/dto/response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  details: string;
}

export class BaseResponseDto<T = any> {
  @ApiProperty()
  result: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: () => ErrorDto, nullable: true })
  error: ErrorDto | null;

  @ApiProperty({ required: false })
  data?: T;
}

export class PagingResponseDto<T = any> {
  @ApiProperty()
  result: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: () => ErrorDto, nullable: true })
  error: ErrorDto | null;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  total?: number;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;

}



export class ResultResponseDto<T = any> {
  @ApiProperty()
  result: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: () => ErrorDto, nullable: true })
  error: ErrorDto | null;
}