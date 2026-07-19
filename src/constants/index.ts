/**
 * 登录凭证 cookie 键名
 */
export const TOKEN_COOKIE_KEY = 'token';
export const TOKEN_EXPIRES_IN = '12h';
export const TOKEN_MAX_AGE = 60 * 60 * 12;
export const TOKEN_EXPIRES_MS = TOKEN_MAX_AGE * 1000;

/**
 * 用户名长度范围
 */
export const USERNAME_MIN_LENGTH = 11;
export const USERNAME_MAX_LENGTH = 20;

/**
 * 密码长度范围
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

/**
 * 用户昵称长度
 */
export const NICKNAME_LENGTH = 12;

/**
 * 邮箱正则表达式
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
