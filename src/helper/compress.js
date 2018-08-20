const { createGzip, createDeflate } = require('zlib');/* 引用压缩方法 */

module.exports = (rs, req, res) => {
  const acceptEncoding = req.headers['accept-encoding'];
  if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) /* mach:找到一个或多个正则表达式的匹配。 */ {
    return rs;
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    res.setHeader('Content-Encoding', 'gzip');
    return rs.pipe(createGzip());
  } else if (acceptEncoding.match(/\bdeflate\b/)) {
    return rs.pipe(createDeflate());
  }
};