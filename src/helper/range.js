module.exports = (totalSize, req, res) => {
  const range = req.headers['range'];
  if (!range) {
    return { code: 200 };
  }

  const sizes = range.match(/bytes=(\d*)-(\d*)/);/*  拿到数组：0：匹配到的内容 1：第一个分组 2：第二个分组 */
  const end = sizes[2] || totalSize - 1;/* 取到结尾 */
  const start = sizes[1] || totalSize - end;

  if (start > end || start < 0 || end > totalSize) {
    return { code: 200 };
  }

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
  res.setHeader('Content-Length', end - start);
  return {
    code: 206,
    start: parseInt(start),
    end: parseInt(end)
  };
};