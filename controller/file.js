const path = require('path');
const fse = require('fs-extra')
const multiparty = require('multiparty') // 解析带有文件上传的FormData插件
const UPLOAD_DIR = path.resolve(__dirname, '..', 'target')
// 封装一个body请求体
const resolvePost = req => {
  new Promise (resolve => {
    // post 参数是慢慢传过来的
    let chunk = ''
    // req 是有事件的
    req.on('data', data => {
      chunk += data; // 二进制
    })
    req.on('end', () =>{
      resolve(JSON.parse(chunk))
    })  
  })
}
const extractExt = fileName => {
  return fileName.slice(fileName.lastIndexOf('.'), fileName.length)
}
const pipeStream = (path, writeStream) => {
  new Promise (resolve => {
    const readStream = fse.createReadStream(path)
    // console.log(readStream, '>>>>>>>')
    // return;
    readStream.on('end', () => {
      resolve()
    })
    readStream.pipe(writeStream);
  })
}
// 返回已经上传切片名列表
const createUploadedList = fileHash =>
  fse.existsSync(path.resolve(UPLOAD_DIR, fileHash))
  ? fse.readdir(path.resolve(UPLOAD_DIR, fileHash))
  : [];
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash);
  const chunkPaths = await fse.readdir(chunkDir)
  chunkPaths.sort((a, b) => a.split('-')[1] - b.split('-')[1]) // 排序
  await Promise.all(
    chunkPaths.map((chunkPath, index) => pipeStream(
        path.resolve(chunkDir, chunkPath),
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1 ) * size
        })
      )
    )
  )
}
class fileData {
  handleVerifyUpload (req, res, next) {
    // 首先拿到post 的data bodyParser
    return new Promise ((resolve, rejuct) => {
      const { fileName, fileHash } = req.body
      const ext = extractExt(fileName) // 获取后缀名
      const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)
      if (!filePath) {
        rejuct()
				return
      } else {
        let data = createUploadedList(fileHash)
        resolve(data)
      }
    })
  }
  async handleFormData (req, res, next) {
    // 带有文件上传的表单插件
    const multipart = new multiparty.Form()
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status = 500
        res.send('process file chunk failed')
        return;
      }
      const [chunk] = files.chunk // 块要从files里拿
      const [hash] = fields.hash // 数据要在fields里拿
      const [filename] = fields.filename
      const [fileHash] = fields.fileHash
      const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${extractExt(filename)}`)
      const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
      console.log(fse.existsSync(filePath), '上传过来了么')
      if (fse.existsSync(filePath)) { // 如果文件有则不需要需要再次上传 ///有问题，稍后看看
        res.send('file exist')
        return;
      }
      if (!fse.existsSync(chunkDir)) {
        // 如果顶级目录地址没有target,则创建target
        await fse.mkdirs(chunkDir);  //  把文件移动到服务器目录中
      }
      await fse.move(chunk.path, path.resolve(chunkDir, hash))
      res.send('receive file chunk')
    })
  }
  async handleMerge (req, res, next) {
    const { filename, fileHash, size } = req.body
    const ext = extractExt(filename); // .jpeg 文件类型
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`); // 文静的路径
    // 开始合并文件
    await mergeFileChunk(filePath, fileHash, size)
    res.send(
      JSON.stringify({
        code: 0,
        message: 'file merged success'
      })
    )
  }
  async handleSingle (req, res, next) { // 文件流形式
    // new multiparty.Form().parse 获取客户端上传的参数，
    return new Promise((resolve, reject) => new multiparty.Form().parse(req, function (err, fields, file) {
      if (err) {
        reject(err)
      }
      if (!fse.existsSync(UPLOAD_DIR)) { // 如果文件夹不存在
        // 则创建一个文件夹
        fse.mkdirSync(`target`)
      } else {
        UPLOAD_DIR
      }

      const [chunk] = file.chunk;
      const [filename] = fields.filename,
      // 存到文件的目录
      chunk_dir = `${UPLOAD_DIR}/${filename}`
      // createReadStream创建一个可读流
      let readStream = fse.createReadStream(chunk.path),
          // createWriteStream,创建可写流，chunk_dir要存的地址
          writeStream = fse.createWriteStream(chunk_dir)
      // 把读的流写到要存的地址里
      readStream.pipe(writeStream)
      // 存完结束事件
      readStream.on('end', function () {
        // 存完之后，删除暂时存在内存中的文件
        fse.unlinkSync(chunk.path);
      })
      resolve([])
    }));
  }
  async handleSingle1 (req, res, next) { // Base64
    let { chunk, filename } = req.body
    if (!fse.existsSync(UPLOAD_DIR)) { // 如果文件夹不存在
      // 则创建一个文件夹
      fse.mkdirSync(`target`)
    } else {
      UPLOAD_DIR
    }
    return new Promise((resolve, reject) => {
      if (chunk && filename) {
        reject()
      }
      let chunk_dri = `${UPLOAD_DIR}/${filename}`
      chunk = decodeURIComponent(chunk).replace(/^data:image\w+;base64,/, '')// 前端编码，后台解码decodeURIComponent，再用replace把转换的base64的头替换去除
      chunk = Buffer.from(chunk, 'base64');// 后台把base64转换成buffer格式，流的概念
      fse.writeFileSync(chunk_dri, chunk)// 创建文件
      resolve([])
    });
  }
}
module.exports = {
  fileData : new fileData()
}