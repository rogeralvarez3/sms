const express = require('express');
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const IO = require("socket.io")
const db = require("./db")
const path = require("path")

app.use(bodyParser.json());
app.use(cors())

app.use(express.static(path.resolve(__dirname,'dist')))
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
var phoneStatus={number:'',id:'',connected:false}
sockets.on("connection",sck=>{
    console.info(`cliente id: ${sck.id} conectado`)
    sockets.emit('phoneStatus',phoneStatus)
    sck.on("sent",data=>{
        sck.broadcast("sent",data)
    })
    sck.on("disconnect",()=>{
        console.warn(`El cliente id: ${sck.id} se ha desconectado`)
        console.log("_________________________________________________")
        if(phoneStatus.id==sck.id){phoneStatus.connected=false;console.log('teléfono desconectado')}
    })
    sck.on("nombreCliente",data=>{
        console.log('Teléfono conectado')
        phoneStatus.id=sck.id
        phoneStatus.number=data.number
        phoneStatus.connected=true
        sockets.emit('phoneStatus',phoneStatus)

    })
})