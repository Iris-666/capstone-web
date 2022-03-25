const { response } = require('express');
var express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var https = require('https');
const body_parser = require('body-parser');
const cors = require('cors');
let lastUserLocation = {latitude: 31.25600, longtitude: 121.5755}
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

// setInterval(() => {
    if(lastUserLocation != userLocation){
        bboxleft = userLocation.longtitude - 0.0001;
        bboxright = userLocation.longtitude + 0.0001;
        bboxbottom = userLocation.latitude - 0.0001;
        bboxtop = userLocation.latitude + 0.0001;
    }

    console.log(bboxleft,bboxright,bboxbottom,bboxtop)

    https.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${bboxleft},${bboxbottom},${bboxright},${bboxtop}`, (response)=>{
    let data = ""
    response.on("data", (chunk)=>{
        data += chunk
    })
    response.on("end", ()=>{
        // console.log(data)
        let arrayData =data.split('<')
        // console.log(arrayData)
        for(let i = 0; i < arrayData.length; i++){
            if(arrayData[i].includes("node")){
                let jsonData = arrayData[i].replace("=", ":")
                // console.log(arrayData[i].replaceAll("=", ":"))

                // console.log(arrayData[i].search("lat="))
            }
        }
    })

})
// }, 10000);

// app.get('/route', async function(req, res)=>{

// })

http.listen(8080, () => {
    console.log('listening on *:8080');
});