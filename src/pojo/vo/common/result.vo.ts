import { HttpBusinessCode } from '@/constants/http';

export interface ResultVO<T> {
  message: string;
  code: HttpBusinessCode;
  data: T;
}
