import 'server-only';

import { nanoid } from 'nanoid';

import { NICKNAME_LENGTH } from '@/constants';
import prisma from '@/lib/database/prisma';
import { LoginDto, RegisterUserDto } from '@/pojo/dto/user/login.dto';

const USER_ID_RETRY_LIMIT = 3;
const NICKNAME_PREFIX = 'user_';
const NICKNAME_RANDOM_LENGTH = NICKNAME_LENGTH - NICKNAME_PREFIX.length;

async function createUniqueUserId() {
  for (let attempt = 0; attempt < USER_ID_RETRY_LIMIT; attempt += 1) {
    const id = nanoid();
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return id;
    }
  }

  throw new Error('Failed to generate a unique user id.');
}

function createNickname() {
  return `${NICKNAME_PREFIX}${nanoid(NICKNAME_RANDOM_LENGTH)}`;
}

/**
 * 注册用户
 */
export async function registerUser(dto: RegisterUserDto): Promise<boolean> {
  try {
    const username = dto.username.trim();
    const email = dto.email?.trim() || null;
    const avatarUrl = dto.avatarUrl?.trim() || null;

    const existingUserByUsername = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (existingUserByUsername) {
      return false;
    }

    await prisma.user.create({
      data: {
        id: await createUniqueUserId(),
        username,
        nickname: createNickname(),
        email,
        password: dto.password,
        gender: dto.gender ?? 'UNKNOWN',
        avatarUrl,
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        gender: true,
        avatarUrl: true,
      },
    });

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * 登录用户
 */
export async function userLogin(dto: LoginDto) {
  try {
    const { username } = dto;
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        nickname: true,
        password: true,
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
}
