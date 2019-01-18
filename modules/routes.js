const fs = require('fs');
const path = require('path');
const qs = require('querystring');
//引入mongo模块 
const MongoClient = require('mongodb').MongoClient;
//定义连接数据库的 url 地址
const url = 'mongodb://localhost:27017';
module.exports = {
  login(req,res){
    var data = fs.readFileSync(path.resolve(__dirname,'../views/login.html'));
    res.writeHead(200,{
      'content-type':'text/html;charset=utf-8'
    });
    res.write(data);
    res.end();
  },
  register(req,res){
    var data = fs.readFileSync(path.resolve(__dirname,'../views/register.html'));
    res.writeHead(200,{
      'content-type':'text/html;charset=utf-8'
    });
    res.write(data);
    res.end();
  },
  home(req,res){
    var data = fs.readFileSync(path.resolve(__dirname,'../views/home.html'));
    res.writeHead(200,{
      'content-type':'text/html;charset=utf-8'
    });
    res.write(data);
    res.end();
  },
  //注册请求
  registerFn(req,res){
    //1.得到页面传递过来的用户名和密码
    var rawData = '';
    req.on('data', (chunk) => {
      rawData += chunk;
    }),
    req.on('end',() =>{
      var params = qs.parse(rawData);

      //2.将用户名和密码写入到数据库中{name: '', pwd: ''}
      MongoClient.connect(url,{useNewUrlParser:true},(error,client) =>{
        //client 数据库的连接对象
        if(error){
          console.log('连接数据库失败')
        }else{
          console.log('连接数据库成功')
          //2.2选择某个数据库(db)
          var db = client.db('test');
          //2.3使用db去操作
          db.collection('user').insertOne({
            name:params.username,
            pwd:params.password
          },(err) => {
            if(err){
              console.log('注册失败');
            }else{
              console.log('注册成功');
            }
            console.log(params.username);
            console.log(params.password);
            //3.记得在操作完成之后,将数据库的链接关闭
            client.close();
            //关闭请求
            res.end();
          })
        }
      })
    })
  },
  //登录请求
  loginFn(req,res){
    res.writeHead(200,{
      'content-type': 'text/html;charset=utf-8'
    });
    var rawData = '';
    req.on("data",(chunk) => {
      rawData += chunk;
    })
    req.on('end',() => {
      var params = qs.parse(rawData);
      MongoClient.connect(url,{ useNewUrlParser : true},(error,client) => {
        if(error){
          console.log('连接数据库失败');
          res.write('连接数据库失败');
          res.end();
        }else{
          console.log('连接数据库成功');
          var db = client.db('test');
          // db.collection('user').find({
          //   name:params.username,
          //   pwd:params.password
          // }).toArray()
          db.collection('user').find({
            name:params.username,
            pwd:params.password
          }).count(function(err,num){
            if(err){
              console.log('查询失败');
            }else{
              console.log('查询成功');
              //判断查找到的纪录条数
              if(num == 1){
                console.log('登录成功');
                res.write('登录成功');
              }else{
                console.log('登录失败');
                res.write('用户名或密码不正确');
              }
            }
            //关闭连接
            //关闭请求
            client.close();
            res.end();
          })
        }
      })
    })
  }
}