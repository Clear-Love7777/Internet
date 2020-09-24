(async function run() {

const koa2 = require('koa2')
const Router = require('koa-router')
const Mysql = require('promise-mysql2')
const Body = require('koa-body')
const app = new koa2()
const router = new Router()
const cors = require("koa2-cors")
app.use(cors()) //解决跨域问题

const staticServer = require('koa-static');
app.use(staticServer(__dirname , 'static'));
app.use(Body())

const con = await Mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port:'3308',
    password: '123456',
    database: 'internet'
})
//登录
router.post('/login',async ctx => {
    const username = ctx.request.body.username
    const password = ctx.request.body.password
    const radio = ctx.request.body.radio
    if(radio==='1'){
    var sql = `SELECT * FROM user where username = '${username}' and password= '${password}'`}
    else{ 
        var sql = `SELECT * FROM manager where username = '${username}' and password= '${password}'`
    }
    const [data] = await con.query(sql)

    console.log(data)
    if(data.length > 0){
        ctx.body = {
            code:200,
            tips:'登录成功'
        }
    }else{
        ctx.body = {
            code:400,
            tips:'登录失败'
        } 
    }
})
//获取所有账户信息
router.get('/getalluseraccount',async ctx =>{
 
    const pagenum = ctx.request.query.pagenum - 1
    const pagesize = ctx.request.query.pagesize
    const query = ctx.request.query.query
    console.log(pagenum,pagesize,query);
    const sql = `SELECT * FROM user`
    if(query !== ''){
    var sql2  = `SELECT * FROM user WHERE username LIKE '%${query}'`
    }else{
     var  sql2 = `SELECT * FROM user LIMIT ${pagenum * pagesize},${pagesize}`
    }
    const [data] = await con.query(sql)
    const [data2] = await con.query(sql2)

  console.log(data);
  if(data.length >= 0 && data2.length>=0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data:data2,
        total:data.length
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})
//更改账户状态
router.put('/updatestatus', async ctx => {

    const id = ctx.request.body.id;
    const newstatus = ctx.request.body.status;
    console.log(id,newstatus);
    let sql =
        `UPDATE user SET status='${newstatus}' WHERE ID=${id};`
        const [data] = await con.query(sql)
    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            data: '修改成功'
        }
    } else {
        ctx.body = {
            code: 400,
            data: '修改失败'
        }
    }

});
// 获取启用账户信息
router.get('/getusingaccount',async ctx =>{
    const sql = `SELECT * FROM user where user.status = 'true'`
  const [data] = await con.query(sql)
  console.log(data);
  if(data.length >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})
// 获取冻结账户信息
router.get('/getfreezingaccount',async ctx =>{
    const sql = `SELECT * FROM user where user.status = 'false'`
  const [data] = await con.query(sql)
  console.log(data);
  if(data.length >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})
//获取个人信息
router.get('/getadminmessage',async ctx =>{
    const sql = `SELECT * FROM manager`
  const [data] = await con.query(sql)
  console.log(data);
  if(data.length >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
});
//编辑用户信息
router.put('/edituser', async ctx => {

    const edit = ctx.request.body;
    let sql =
        `UPDATE user SET username='${edit.username}', account='${edit.account}', status='${edit.status}', mobile='${edit.mobile}',
        password='${edit.password}',email='${edit.email}'  WHERE id=${edit.id};`
        const [data] = await con.query(sql)
    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            tips: '修改成功',
            data
        }
    } else {
        ctx.body = {
            code: 400,
            tips: '修改失败'
        }
    }

});
//开户
router.post('/adduser',async ctx =>{
    const add = ctx.request.body;
    const [data] = await con.query("INSERT INTO user (username,account,status,mobile,password,email) VALUE ('" + add.username + "','" + add.account + "','" + add.status + "','" + add.mobile + "','" + add.password + "','" + add.email + "')");
  console.log(data);
  if(data.affectedRows >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})
//删除用户接口
router.delete('/userdelete', async ctx => {
    const id = ctx.request.query.id;
     console.log(id)
    const sql = `DELETE FROM user WHERE user.id = ${id}`;
    const [data] = await con.query(sql)

    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            data: '修改成功'
        }
    } else {
        ctx.body = {
            code: 400,
            data: '修改失败'
        }
    }

});

//获取新闻
router.get('/getnews',async ctx =>{
    const sql = `SELECT * FROM news`
  const [data] = await con.query(sql)
  console.log(data);
  if(data.length >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})

//编辑新闻
router.put('/editnews', async ctx => {

    const edit = ctx.request.body;
    let sql =
        `UPDATE news SET title='${edit.title}', content='${edit.content}', author='${edit.author}'  WHERE id=${edit.id};`
        const [data] = await con.query(sql)
    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            tips: '修改成功',
            data
        }
    } else {
        ctx.body = {
            code: 400,
            tips: '修改失败'
        }
    }

});

//添加新闻
router.post('/addnews',async ctx =>{
    const add = ctx.request.body;
    const [data] = await con.query("INSERT INTO news (title,content,author) VALUE ('" + add.title + "','" + add.content + "','" + add.author + "')");
  console.log(data);
  if(data.affectedRows >= 0){
    ctx.body = {
        code:200,
        tips:'获取数据成功',
        data
    }
}else{
    ctx.body = {
        code:400,
        tips:'获取数据失败'
    } 
}
})
//删除新闻
router.delete('/newsdelete', async ctx => {
    const id = ctx.request.query.id;
     console.log(id)
    const sql = `DELETE FROM news WHERE news.id = ${id}`;
    const [data] = await con.query(sql)

    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            data: '修改成功'
        }
    } else {
        ctx.body = {
            code: 400,
            data: '修改失败'
        }
    }

});
//管理员修改密码
router.put('/editpassword', async ctx => {
    const edit = ctx.request.body.password;
    console.log(edit);
    const sql =
        `UPDATE manager SET password ='${edit}'  WHERE manager.username = 'admin';`
        const [data] = await con.query(sql)
    if (data.affectedRows > 0) {
        ctx.body = {
            code: 200,
            tips: '修改成功',
            data
        }
    } else {
        ctx.body = {
            code: 400,
            tips: '修改失败'
        }
    }
});

app.use(router.routes())
app.listen(80,() => {
    console.log('app start')
})

})()