const { exec, escape  } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

let login = (username, password) => {
  username = escape(username)

  //生成密码
  password = genPassword(password)
  password = escape(password) // escape sql原生方法，防止sql注入

  // const sql = `
  //   select username, realname from users where username = ${username} and password = ${ password }
  // `
  const sql = `
                select u.*, r.*, a.*  from users u
                left join roles r on r.id = u.role_id 
                left join roles_authority ra on r.id = ra.role_id
                left join routers a on a.id = ra.auth_id where u.username = ${ username }
                and u.password = ${ password };
              `
  return exec(sql).then( rows => {
    return rows || []
  })
}

module.exports = {
  login
}
