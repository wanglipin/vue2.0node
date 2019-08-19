const redis = require('redis')
const { REDIS_CONFIG } = require('../config/db')

// 创建链接
const redisClient = redis.createClient(REDIS_CONFIG.port, REDIS_CONFIG.host)
// console.log(redisClient)
redisClient.on('error', err => {
  console.error(err)
})

function set (key, val) {
  if (typeof val === 'object') {
    val = JSON.stringify(val)
  }
  redisClient.set(key, val, redis.print)
}

function get (key) {
  const promise = new Promise((resolve, reject) => {
    redisClient.get(key, (err, val) => {
      if (err) {
        reject(err)
        return
      }
      if (!key) {
        resolve(null)
        return
      }
      try {
        resolve(
          JSON.parse(val)
        )
      } catch (error) {
        reject(val)
      }
    })
  })
  return promise
}

module.exports = {
  redisClient,
  set,
  get
}