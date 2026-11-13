/**
 * 手动实现 JWT (HS256) 生成
 * @param {object} payload - JWT 负载数据 (会自动添加 iat)
 * @param {string} secret - 密钥
 * @returns {Promise<string>} - 生成的 JWT
 */
export async function generateJWT(payload, secret) {
  // 1. 生成 Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // 2. 添加签发时间 (iat)
  const data = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  // 3. Base64Url 编码函数
  const base64url = str => {
    const uintArray = new Uint8Array(str);
    return btoa(String.fromCharCode(...uintArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // 4. 编码 Header 和 Payload
  const encoder = new TextEncoder();
  const encodedHeader = base64url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64url(encoder.encode(JSON.stringify(data)));

  // 5. 准备签名内容
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // 6. 生成 HMAC-SHA256 签名
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));

  // 7. 组合完整 JWT
  return `${signatureInput}.${base64url(signature)}`;
}
