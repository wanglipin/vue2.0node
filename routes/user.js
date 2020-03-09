const express = require('express')
const { login } = require('../controller/user')
const { info } = require('../controller/info')
const { SuccessModel, ErrorMode } = require('../models/resModel')
// 1.创建一个路由容器
const router = express.Router() // 2.把所有的路由都挂载到这个路由容器中
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const result = login(username, password)
  function treeData (data) {
    let cloneData = JSON.parse(JSON.stringify(data))    // 对源数据深度克隆
    return cloneData.filter(father=>{
      let branchArr = cloneData.filter(child=>father.id == child.parent_id)    //返回每一项的子级数组
      branchArr.length > 0 ? father.children = branchArr : ''   //如果存在子级，则给父级添加一个children属性，并赋值
      return father.parent_id == 0;      //返回第一层
    });
  }
  return result.then(datas => {
    let auths = treeData(datas)
    if (auths[0].username) {
      // 设置session
      req.session.token = 'admin-token'
      auths[0].token = 'admin-token'
      let cc ={
        auths: auths
      }
      res.json(
        new SuccessModel(cc, '用户登录成功')
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
