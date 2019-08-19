const { exec, escape  } = require('../db/mysql')

let info = (token, username) => {
  if (token) {
    const infoSql = `
    select * from userinfo where name = ${username}
  `
    return exec(infoSql).then( rows => {
      return rows[0] || {}
    })
  }
}
module.exports = {
  info
}
