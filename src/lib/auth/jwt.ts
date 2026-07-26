import { TOKEN_EXPIRES_IN } from '@/constants';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET;

/**
 * 创建 jwt token
 * @param payload
 * @param options
 * @returns
 */
export const generateToken = (payload: string | Buffer | object, options = {}) => {
  try {
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未配置');
    }
    const token = jwt.sign(payload, jwtSecret, { ...options, expiresIn: TOKEN_EXPIRES_IN });
    return token;
  } catch (error) {
    throw error;
  }
};

/**
 * 验证 jwt token
 * @param token
 * @returns
 */
export const verifyToken = (token: string): JwtPayload | string => {
  try {
    if (!jwtSecret) {
      throw new Error('JWT_SECRET 未配置');
    }
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw error;
  }
};
