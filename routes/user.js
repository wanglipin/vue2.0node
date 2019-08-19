const express = require('express')
const { login } = require('../controller/user')
const { info } = require('../controller/info')
const { SuccessModel, ErrorMode } = require('../models/resModel')
// 1.创建一个路由容器
const router = express.Router() // 2.把所有的路由都挂载到这个路由容器中

router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const result = login(username, password)
  return result.then(data => {
    let arr = [];
    let obj = {};
    data.forEach(item => {
      if (item.parent_id == 0) {
        obj.name = item.name
        obj.remark = item.remark
        obj.children = 'null'
        obj.id = item.id
        obj.parent_id = item.parent_id
        obj.created_id = item.created_id
        obj.mender_id = item.mender_id
        obj.props = item.props
        obj.path = item.path
        obj.icon = item.icon
        obj.category = item.category
        obj.prority = item.prority
        obj.is_tentant = item.is_tentant
        obj.router = item.router
        obj.component = item.component
        obj.redirect = item.redirect
        obj.meta = item.meta
        obj.params = item.params
        arr.push(obj)
      } else {
        arr.forEach( x => {
          if (x.id == item.parent_id) {
            x.children = []
          }
        })
      }
    });
    console.log(arr,'obj')
    return
    if (data.username) {
      // 设置session
      req.session.token = 'admin-token'
      data.token = 'admin-token'
      res.json(
        new SuccessModel(data, '登录成功')
      )
      return
    }
    res.json(
      new ErrorMode('登陆失败')
      )
  })
})
router.post('/Info', (req, res, next) => {
  const { token, name } = req.body
  const infoData = info(token, name)
  return infoData.then(data => {
    if (data) {
      res.json(
        new SuccessModel(data, '查询成功')
      )
    }
    res.json(
      new ErrorMode('查询失败')
    )
  })
})
module.exports = router
