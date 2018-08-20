module.exports = {
  root: process.cwd(),
  hostname: '127.0.0.1',
  port: 9527,
  compress: /\.(html|js|css|md)/, /* 压缩限制的拓展名 */
  cache: {
    maxAge: 600, /* 有效时间 */
    expires: true,
    cacheControl: true,
    lastModified: true,
    etag: true
  }
};