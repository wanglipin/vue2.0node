const { ErrorModel } = require('../models/resModel')

// 封装中间件
module.exports = (req, res, next) => {
  // 如有有token则已经登录
  if (req.success.token) {
    next()
    return
  }
  res.json(
    // 否则为登录
    ErrorModel('未登陆')
  )
}