const { response } = require('express');
var express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var https = require('https');
let userLocation = {latitude: 31.25608, longtitude: 121.5755}


app.use(express.static('public'))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('new connection', socket.id)
    socket.on("PING", (data)=>{
        console.log("ping" + data)
        io.emit("PONG","pings")
    })

})

https.get("https://www.openstreetmap.org/api/0.6/node/602360462/ways", (response)=>{
    let data = ""
    response.on("data", (chunk)=>{
        data += chunk
        // console.log(data)
    })

    response.on("end", ()=>{
        // console.log(data)
    })
})

https.get("https://api.openstreetmap.org/api/0.6/map?bbox=121.5750,31.25600,121.5760,31.25610", (response)=>{
    let data = ""
    response.on("data", (chunk)=>{
        data += chunk
    })

    response.on("end", ()=>{
        console.log(data)
    })

})

http.listen(8080, () => {
    console.log('listening on *:8080');
});