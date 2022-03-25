const { response } = require('express');
var express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
// var io = require('socket.io')(http);
var https = require('https');
const body_parser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
let lastUserLocation = {latitude: 31.25600, longitude: 121.5755}
// let userLocation = {latitude: 31.25608, longitude: 121.5755}
let userLocation = {latitude: 31.25808, longitude: 121.5755}


app.use(express.static('public'))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// io.on('connection', (socket) => {
//     console.log('new connection', socket.id)
//     socket.on("PING", (data)=>{
//         console.log("ping" + data)
//         io.emit("PONG","pings")
//     })

// })

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
        bboxleft = userLocation.longitude - 0.0001;
        bboxright = userLocation.longitude + 0.0001;
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
        let allNodes = {}
        // console.log(arrayData)
        for(let i = 0; i < arrayData.length; i++){
            if(arrayData[i].includes("node")){
                // let jsonData = arrayData[i].replace("=", ":")
                // console.log(arrayData[i])
                let nodeID = arrayData[i].substring(9, 19)
                let nodeLat = arrayData[i].substring(arrayData[i].search("lat=")+5, arrayData[i].indexOf(`"`,arrayData[i].search("lat=")+5))
                let nodeLong = arrayData[i].substring(arrayData[i].search("lon=")+5,arrayData[i].indexOf(`"/`,arrayData[i].search("lon=")+5))
                allNodes[nodeID] = {"nodeLat": nodeLat, "nodeLong": nodeLong}
                // console.log(nodeLat, nodeLong)

            }
        }
        let shortest = 0
        let closestNode
        for(let key in allNodes){
            let distance = twoPointDistance(parseFloat(userLocation.latitude), parseFloat(userLocation.longitude),parseFloat(allNodes[key].nodeLat), parseFloat(allNodes[key].nodeLong))
            // console.log(distance)
            allNodes[key].distance = distance
            if(distance < shortest || shortest == 0){
                shortest = distance
            }
        }
        for(let key in allNodes){
            if(allNodes[key].distance == shortest){
                closestNode = key
            }
        }
        console.log(closestNode) 
        //the node that is closest to the user
        https.get(`https://www.openstreetmap.org/api/0.6/node/${closestNode}/ways`,(response)=>{
            let data = ""
            response.on("data", (chunk)=>{
                data += chunk
            })
            response.on("end", ()=>{
                console.log(data)
                document.write(data)
            })
        })
    })

})
// }, 10000);

// app.get('/route', async function(req, res)=>{

// })

app.get('/SendLocation', async function(req, res) {
    let lat = parseFloat(req.query.lat);
    let long = parseFloat(req.query.long);

    bboxleft = long - 0.0001;
    bboxright = long + 0.0001;
    bboxbottom = lat - 0.0001;
    bboxtop = lat + 0.0001;

    // if(lastUserLocation != userLocation){
        bboxleft = long - 0.0001;
        bboxright = long + 0.0001;
        bboxbottom = lat - 0.0001;
        bboxtop = lat + 0.0001;
        // }

    console.log(bboxleft,bboxright,bboxbottom,bboxtop)

    https.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${bboxleft},${bboxbottom},${bboxright},${bboxtop}`, (response)=>{
    let data = ""
    response.on("data", (chunk)=>{
        data += chunk
    })
    response.on("end", ()=>{
        // console.log(data)
        let arrayData =data.split('<')
        let allNodes = {}
        // console.log(arrayData)
        for(let i = 0; i < arrayData.length; i++){
            if(arrayData[i].includes("node")){
                // let jsonData = arrayData[i].replace("=", ":")
                // console.log(arrayData[i])
                let nodeID = arrayData[i].substring(9, 19)
                let nodeLat = arrayData[i].substring(arrayData[i].search("lat=")+5, arrayData[i].indexOf(`"`,arrayData[i].search("lat=")+5))
                let nodeLong = arrayData[i].substring(arrayData[i].search("lon=")+5,arrayData[i].indexOf(`"/`,arrayData[i].search("lon=")+5))
                allNodes[nodeID] = {"nodeLat": nodeLat, "nodeLong": nodeLong}
                // console.log(nodeLat, nodeLong)

            }
        }
        let shortest = 0
        let closestNode
        for(let key in allNodes){
            let distance = twoPointDistance(parseFloat(lat), parseFloat(long),parseFloat(allNodes[key].nodeLat), parseFloat(allNodes[key].nodeLong))
            // console.log(distance)
            allNodes[key].distance = distance
            if(distance < shortest || shortest == 0){
                shortest = distance
            }
        }
        for(let key in allNodes){
            if(allNodes[key].distance == shortest){
                closestNode = key
            }
        }
        console.log(closestNode) 
        //the node that is closest to the user
        https.get(`https://www.openstreetmap.org/api/0.6/node/${closestNode}/ways`,(response)=>{
            let data = ""
            response.on("data", (chunk)=>{
                data += chunk
            })
            response.on("end", ()=>{
                console.log(data)
                document.write(data)
            })
        })
    })

})


    let waypoints = [];


    waypoints.push({ lat: 55.555, long: 66.666, label: "Go here next" });


    res.json(waypoints);
});


http.listen(8080, () => {
    console.log('listening on *:8080');
});

function twoPointDistance(x1,y1,x2,y2){
    let dep = Math.sqrt(Math.pow((x1*100 - x2*100), 2) + Math.pow((y1*100 - y2*100), 2));
    // console.log(x1, x2,y1,y2)
    return dep;
}

