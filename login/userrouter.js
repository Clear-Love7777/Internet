const Router = require('koa-router')
const Mysql = require('promise-mysql2'); //引入mysql,mysql依赖
const mysql_nico ={
    host: 'localhost',
    user: 'root',
    port:'3308',
    password: '123456',
    database: 'internet+++'
}
// 导入数据库登录信息

const userrouter = new Router()

Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
}

//查询所有用户信息接口(测试)
userrouter.get('/test', async ctx => {
    const connection = await Mysql.createConnection(mysql_nico)
    const sql = "SELECT * FROM user";
    const [rs] = await connection.query(sql);
    connection.end(function(err){})
    ctx.body = {
        rs
    }
});

// //根据id查询用户信息
// userrouter.get('/getuserinformation/:id', async ctx => {
//     let id = ctx.params.id  //一页多少条记录

//     const connection = await Mysql.createConnection(mysql_nico)
//     const sql = `SELECT * FROM user where id = ${id}`;
//     const [rs] = await connection.query(sql);
//     connection.end(function(err){})
//     ctx.body = {
//         rs
//     }
// });

// 修改个人信息
userrouter.post('/updateuserinformation', async ctx => {
    const form = ctx.request.body

    const connection = await Mysql.createConnection(mysql_nico)
    const sql = `UPDATE user SET username = '${form.username}',
                email = '${form.email}' , phone = '${form.phone}'
                WHERE id = '${form.id}';`
    const [rs] = await connection.query(sql);
    connection.end(function(err){})

    ctx.body = {
        code:200,
        rs
    }
});

// 存款
userrouter.post('/save', async ctx => {
    const data = ctx.request.body
console.log(data)
    const connection = await Mysql.createConnection(mysql_nico)

    const sql1 = `select money from user WHERE id = '${data.id}';`
    const [rs1] = await connection.query(sql1);
    let money = Number(rs1[0].money)+Number(data.money)

    const sql2 = `UPDATE user SET money = '${money}' WHERE id = '${data.id}';`
    const [rs2] = await connection.query(sql2);

    // 存入交易记录
    let time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    const sql3 = `INSERT INTO transaction ( money , time , state , userid ,balance ) 
                    VALUES ( '${data.money}', '${time}','0','${data.id}','${money}');`
    await connection.query(sql3);

    connection.end(function(err){})

    ctx.body = {
        code:200,
        rs2
    }
});

// 取款
userrouter.post('/withdrawal', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql_nico)

    const sql1 = `select money from user WHERE id = '${data.id}';`
    const [rs1] = await connection.query(sql1);

    let money = Number(rs1[0].money)-Number(data.money)
    if(money<0){
        return ctx.body = {
            code:400,
            message:'账户余额不足'
        }
    }

    const sql2 = `UPDATE user SET money = '${money}' WHERE id = '${data.id}';`
    const [rs2] = await connection.query(sql2);

    // 存入交易记录
    let time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    const sql3 = `INSERT INTO transaction ( money , time , state , userid ,balance ) 
                    VALUES ( '${data.money}', '${time}','1','${data.id}','${money}');`
    await connection.query(sql3);

    connection.end(function(err){})

    ctx.body = {
        code:200,
        rs2
    }
});

// 根据id获取交易记录
userrouter.get('/getusertransaction/:id/:currentpage/:pagesize', async ctx => {
    let id = ctx.params.id
    let currentpage = ctx.params.currentpage
    let pagesize = ctx.params.pagesize

    let num = (currentpage-1)*pagesize

    const connection = await Mysql.createConnection(mysql_nico)
    const sql = `select t.* from (
                    SELECT a.id,a.otherid,b.username,a.money,a.time,a.state,a.balance FROM transaction a,user b 
                    where a.userid = ${id} and a.otherid = b.id 
                    union all   
                    SELECT id,otherid,otherid,money,time,state,balance FROM transaction where userid = ${id} and otherid IS NULL) t 
                order by t.id desc limit ${num} , ${pagesize};`
    const [rs] = await connection.query(sql);
    connection.end(function(err){})

    ctx.body = {
        code:200,
        rs
    }
});

// 根据id获取交易记录总数
userrouter.get('/getcountusertransaction/:id', async ctx => {
    let id = ctx.params.id

    const connection = await Mysql.createConnection(mysql_nico)
    const sql = `select count(*) from (
                    SELECT a.id,a.otherid,b.username,a.money,a.time,a.state,a.balance FROM transaction a,user b 
                    where a.userid = ${id} and a.otherid = b.id 
                    union all   
                    SELECT id,otherid,otherid,money,time,state,balance FROM transaction where userid = ${id} and otherid IS NULL) t 
                order by t.id desc;`;
    const [rs] = await connection.query(sql);
    connection.end(function(err){})
    ctx.body = {
        code:200,
        rs:rs[0]['count(*)']
    }
});

// 根据名称查询用户是否存在 
userrouter.get('/checktouser/:username', async ctx => {
    let username = ctx.params.username

    const connection = await Mysql.createConnection(mysql_nico)
    const sql = `SELECT id,state FROM user where username = '${username}'`;
    const [rs] = await connection.query(sql);
    connection.end(function(err){})

    if(rs.length===0){
        return ctx.body = {
            code:201,
            message:'用户不存在'
        }
    }

    ctx.body = {
        code:200,
        touserid:rs[0].id,
        touserstate:rs[0].state
    }
});

// 转账
userrouter.post('/transfer', async ctx => {
    const data = ctx.request.body

    const connection = await Mysql.createConnection(mysql_nico)

    // 查询自己的余额
    const sql1 = `select money from user WHERE id = '${data.id}';`
    const [rs1] = await connection.query(sql1);

    let money = Number(rs1[0].money)-Number(data.money)
    if(money<0){
        return ctx.body = {
            code:400,
            message:'账户余额不足'
        }
    }

    // 查询对方的余额
    const sql2 = `select money from user WHERE id = '${data.toid}';`
    const [rs2] = await connection.query(sql2);
    toUserMoney = rs2[0].money

    // 减少自己的余额
    const sql3 = `UPDATE user SET money = '${money}' WHERE id = '${data.id}';`
    const [rs3] = await connection.query(sql3);

    // // 增加对方的余额
    const sql4 = `UPDATE user SET money = '${toUserMoney+Number(data.money)}' WHERE id = '${data.toid}';`
    const [rs4] = await connection.query(sql4);

    // 添加我方转账交易记录
    let time = new Date().Format("yyyy-MM-dd hh:mm:ss");
    const sql5 = `INSERT INTO transaction ( otherid , money , time , state , userid ,balance ) 
                    VALUES ( '${data.toid}','${data.money}', '${time}','2','${data.id}','${money}');`
    const [rs5] = await connection.query(sql5);

    // 添加对方收款交易记录
    const sql6 = `INSERT INTO transaction ( otherid , money , time , state , userid ,balance ) 
    VALUES ( '${data.id}','${data.money}', '${time}','3','${data.toid}','${toUserMoney+Number(data.money)}');`
    const [rs6] = await connection.query(sql6);

    connection.end(function(err){})

    ctx.body = {
        code:200,
        message:'转账成功'
    }
});

// // 修改密码
// userrouter.post('/usermidifypwd', async ctx => {
//     const data = ctx.request.body

//     const connection = await Mysql.createConnection(mysql_nico)

//     const sql = `UPDATE user SET password = '${data.pwd}' WHERE id = '${data.id}';`
//     const [rs] = await connection.query(sql);

//     connection.end(function(err){})

//     ctx.body = {
//         code:200,
//         rs
//     }
// });


module.exports = userrouter
