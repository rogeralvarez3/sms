const express = require('express');
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const IO = require("socket.io")
const db = require("./db")

app.use(bodyParser.json());
app.use(cors())

app.get("/",(req,res)=>{
    res.send("Hola, soy el servidor")
})
app.get("/get",(req,res)=>{
    db.get(req.query).then(r=>{
        res.send(r)
    })
})
app.post("/sms",(req,res)=>{
    var data=req.body
    console.log(data)
    sockets.emit("newSMS",data)
    res.send({icon:'success',text:'mensaje enviado'})
})
const port  = process.env.PORT  || 3006
const server = app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

const sockets = IO.listen(server)

sockets.on("connection",sck=>{
    console.info(`cliente id: ${sck.id} conectado`)
    sck.on("sent",data=>{
        sck.broadcast("sent",data)
    })
    sck.on("disconnect",()=>{
        console.warn(`El cliente id: ${sck.id} se ha desconectado`)
        console.log("_________________________________________________")
    })
})