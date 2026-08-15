/**
 * 更新用户信息 dto
 */
export interface UpdateUserDto {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  avatarUrl?: string;
}
