const mysql = require("mysql")
var cn;
function connect(){
    cn=mysql.createConnection({
        port:3312,
        host:'192.168.1.66',
        user:'root',
        password:'root@',
        database:'sms'
    })
} 
connect()
cn.on("error",err=>{
    //console.log(err)
    connect()
})
const get = async data=>{
    let result = new Promise(resolve=>{
        if(!data.whereCondition){data.whereCondition=""}
        let sql = `select ${ data.fields } from ${ data.table + data.whereCondition }`
        cn.query(sql,(err,rows)=>{
            if(err){resolve(err)}
            else{resolve(rows)}
        })
    })
    return await result
}
const save = async data=>{
    var sql=""
    var fieldsValues="",fields="",values=""
    var table = "`"+data.table+"`"
    Object.keys(data.data).forEach(k=>{
        if(k!="id"){
            fieldsValues+="`k`='"+data.data[k]+"',"
            fields+="`k`,"
            values+=`'${data.data[k]}',`
        }
    })
    if(data.data.id>0){
        sql=`update ${table} set ${fieldsValues.substr(0,fieldsValues.length-1)} where id='${data.data.id}';`
    }else{
        sql =`insert into ${table}(${fields}) values(${values});`
    }
    let result = new Promise(resolve=>{
        let sql = `select ${ data.fields } from ${ data.table + data.whereCondition }`
        cn.query(sql,(err,rows)=>{
            if(err){resolve(err)}
            else{resolve(rows)}
        })
    })
    return await result
}
const remove = async data=>{
    let result = new Promise(resolve=>{
        let sql = `delete from ${ data.table} where id='${data.id}'`
        cn.query(sql,(err,rows)=>{
            if(err){resolve(err)}
            else{resolve(rows)}
        })
    })
    return await result
}
module.exports = {get,save,remove}