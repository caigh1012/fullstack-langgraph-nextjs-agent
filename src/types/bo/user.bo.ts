import { UpdateUserDto } from '../dto/user.dto';

export interface UpdateUserBo extends UpdateUserDto {
  id: string;
  username: string;
}
