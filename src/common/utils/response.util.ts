// common/utils/response.util.ts
export const successResponse = (data: any, message = '성공') => ({
  result: true,
  message,
  error: null,
  data,
});

export const paginatedResponse = (
  data: any[],
  total: number,
  page: number,
  limit: number,
  message = '목록 조회 성공',
) => ({
  result: true,
  message,
  error: null,
  data,
  total,
  page,
  limit,
});

export const errorResponse = (message: string, code: string, details: string) => ({
  result: false,
  message,
  error: { code, details },
});

export const dataOnlyResponse = (data: any) => ({
  data,
});
