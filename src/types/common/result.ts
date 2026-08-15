import { HttpBusinessCode } from '@/constants/http';

export interface Result<T> {
  message: string;
  code: HttpBusinessCode;
  data: T;
}
