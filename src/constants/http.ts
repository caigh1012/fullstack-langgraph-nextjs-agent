/**
 * http 状态码
 */
class HttpCode {
  // 成功
  static readonly SUCCESS = 200;
  // 请求参数校验失败
  static readonly BAD_REQUEST = 400;
  // 未授权
  static readonly UNAUTHORIZED = 401;
  // 内部服务器错误
  static readonly INTERNAL_SERVER_ERROR = 500;
}

/**
 * 业务错误码
 */
class HttpBusinessCode {
  // 成功
  static readonly SUCCESS = '0000';
  // 失败
  static readonly FAIL = '9999';
}

/**
 * http 消息
 */
class HttpMessage {
  static readonly PARAM_VALIDATION_ERROR = '请求参数校验失败';
  static readonly CREDENTIALS_INVALID = '用户名和密码不正确，请重新输入';
  static readonly REGISTER_FAILED = '注册失败';
  static readonly REGISTER_SUCCESS = '注册成功';
  static readonly UNAUTHORIZED = '未授权，请先登录';
  static readonly TOKEN_INVALID = '非法token, 重新登录';
  static readonly TOKEN_EXPIRED = 'token过期, 重新登录';
  static readonly LOGOUT_SUCCESS = '退出登录成功';
  static readonly INTERNAL_SERVER_ERROR = '服务器错误，请稍后重试';
  static readonly REQUEST_SUCCESS = '请求成功';
  static readonly REQUEST_FAILED = '请求失败';
}

export { HttpCode, HttpBusinessCode, HttpMessage };
