const express = require('express')
const { fileData } = require('../controller/file')
const fse = require('fs-extra'); // fs的扩展包
const { SuccessModel, ErrorMode } = require('../models/resModel')
// 1.创建一个路由容器
const router = express.Router() // 2.把所有的路由都挂载到这个路由容器中

router.post('/verify', (req, res, next) => {
 return fileData.handleVerifyUpload(req, res, next).then(data => {
    if (data) {
      if (fse.existsSync(data)) {
        // new ErrorMode('查询失败')
        return
      } else {
        res.json(
          new SuccessModel({
            showldUpload: true,
            uploadedList: data
          })
        )
      }
    }
    res.json(
      // new ErrorMode('查询失败')
    )
  })
})

router.post('/verify/chunk', (req, res, next) => {
  // 上传切片处理
  return fileData.handleFormData(req, res, next)
})

router.post('/verify/merge', (req, res, next) => {
  return fileData.handleMerge(req, res, next)
})
// 普通单文件上传
router.post('/verify/single', (req, res, next) => {
  return fileData.handleSingle(req, res, next).then(data => {
    if (data) {
      res.json(
        new SuccessModel(data, '上传成功')
      )
    }
    res.json(
      new ErrorMode('查询失败')
    )
  })
})
router.post('/verify/single1', (req, res, next) => {
  return fileData.handleSingle1(req, res, next).then(data => {
    if (data) {
      res.json(
        new SuccessModel(data, '上传成功')
      )
    }
    res.json(
      new ErrorMode('查询失败')
    )
  })
})

module.exports = router
