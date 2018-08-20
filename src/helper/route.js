const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cache');
const tplpath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplpath);
const template = Handlebars.compile(source.toString());
module.exports = async function (req, res, filePath, config) {
  try {
    const stats = await stat(filePath);
    if (stats.isFile()) {
      const contentType = mime(filePath);

      res.setHeader('Content-Type', contentType);
      /*       fs.readFile(filePath, (err, data) => { 
              res.end(data);
            }); */
      if (isFresh(stats, req, res)) {
        res.statusCode = 304;
        res.end();
        return;
      }

      let rs;
      const { code, start, end } = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      } else {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, { start, end });
      }
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res);  /* 要改变rs所以前面要用let */
      }/* 压缩 */
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      const dir = path.relative(config.root, filePath);/* 一个路径相对于另一个路径的相对地址,若是相对于同样的路径，则返回空 */
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}`/* 从根路径开始  */ : '',
        files: files.map(file => {/*  把每个元素通过函数传递到当前匹配集合中 */
          return {
            file,
            icon: mime(file)
          }
        })
      };
      res.end(template(data));
    }
  } catch (ex) {
    console.error(ex);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`${filePath} is not a directory or file\n ${ex.toString()}`);
  }
}