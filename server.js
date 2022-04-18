const { response } = require('express');
var express = require('express')
var app = require('express')();
var http = require('http').createServer(app);
// var io = require('socket.io')(http);
var https = require('https');
let fetch = require('node-fetch');
const body_parser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
let lastUserLocation = {latitude: 31.25600, longitude: 121.5755}
// let userLocation = {latitude: 31.25608, longitude: 121.5755}
let userLocation = {latitude: 31.25808, longitude: 121.5755}

let wayTags = ["primary", "secondary", "residential", "footway", "tertiary"]


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


app.get('/SendLocation', async function(req, res) {
    let lat = parseFloat(req.query.lat);
    let long = parseFloat(req.query.long);
    let nextNode
    let sendBackMsg = []
  
  console.log("lat= "+lat + "long = "+long)
    
    let bboxleft, bboxright,bboxbottom, bboxtop
    // if(lastUserLocation != userLocation){
        bboxleft = long - 0.00015;
        bboxright = long + 0.00015;
        bboxbottom = lat - 0.00015;
        bboxtop = lat + 0.00015;
        // }

    console.log(bboxleft,bboxright,bboxbottom,bboxtop)

    https.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${bboxleft},${bboxbottom},${bboxright},${bboxtop}`, (response)=>{
    let data = ""
    response.on("data", (chunk)=>{
        data += chunk
    })
    response.on("end", ()=>{
        let arrayData =data.split('<')
        let allNodes = {}
        for(let i = 0; i < arrayData.length; i++){
            if(arrayData[i].includes("node")){
                // console.log(arrayData[i])
                let nodeID = arrayData[i].substring(arrayData[i].search("id=")+4, arrayData[i].indexOf(`"`,arrayData[i].search("id=")+4))
                // console.log(nodeID)
                let nodeLat = arrayData[i].substring(arrayData[i].search("lat=")+5, arrayData[i].indexOf(`"`,arrayData[i].search("lat=")+5))
                let nodeLong = arrayData[i].substring(arrayData[i].search("lon=")+5,arrayData[i].indexOf(`"/`,arrayData[i].search("lon=")+5))
                allNodes[nodeID] = {"nodeLat": nodeLat, "nodeLong": nodeLong}
            }
        }
        let shortest = 0
        let closestNode
        for(let key in allNodes){
            let distance = twoPointDistance(parseFloat(lat), parseFloat(long),parseFloat(allNodes[key].nodeLat), parseFloat(allNodes[key].nodeLong))
            //console.log(distance)
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
        //the node that is closest to the user
        // console.log("closestNode: "+closestNode) 


        // https.get("https://www.openstreetmap.org/api/0.6/node/103990314/ways", (response)=>{
            https.get(`https://www.openstreetmap.org/api/0.6/node/${closestNode}/ways`,(response)=>{
            let data = ""
            let crossroad;
            let crossroads = []

            let validData = [];
            // let crossroads = []

            response.on("data", (chunk)=>{
                data += chunk
            })
            response.on("end", ()=>{
                let arrayData =data.split('<')
                
                // console.log(arrayData)
                for(let i = 0; i < arrayData.length; i++){
                    if(arrayData[i].includes("nd ref=")){
                        validData.push(arrayData[i])
                    }
                }
                let accomplished = 0;
                for(let i = 0; i<validData.length; i++){
                    let nodeID = validData[i].substring(validData[i].search("ref=")+5, validData[i].indexOf(`"/`, validData[i].search("ref=")+5))
                    getCrossRoads(nodeID).then(crossroad =>{
                        accomplished ++;
                        if(crossroad.length > 1){
                            crossroads.push(nodeID)
                            console.log("push")
                        }
                        if(accomplished == validData.length-1){
                            console.log("these nodes contains crossroads: ")
                            console.log(crossroads)
                            let nodeIndex = Math.floor(Math.random() * crossroads.length)
                            nextNode = crossroads[nodeIndex]
                            getNodeData(nextNode).then(nodeData=>{
                                let lat = nodeData.substring(nodeData.search("lat=")+5, nodeData.indexOf(`"`,nodeData.search("lat=")+5))
                                let long = nodeData.substring(nodeData.search("lon=")+5,nodeData.indexOf(`"/`,nodeData.search("lon=")+5))
                                console.log("lat: "+lat+" long: "+long)

                            })
                            sendBackMsg.push({nodeID: nextNode, lat: lat, long: long})
                            res.json(sendBackMsg)
                        }
                    })
                }

            })
        })
    })

})


    let waypoints = [];



    waypoints.push({ lat: 55.555, long: 66.666, label: "Go here next" });


    // res.json(waypoints);
});


http.listen(8080, () => {
    console.log('listening on *:8080');
});


async function getWays(id) {
	let response = await fetch('https://www.openstreetmap.org/api/0.6/node/' + id + '/ways.json');
    return await response.json();
}

async function getNodeData(id){
	let response = await fetch('https://www.openstreetmap.org/api/0.6/node/' + id);
    // console.log(response.text())
    return await response.text();
}
async function getCrossRoads(nodeID){
    let ways = await getWays(nodeID)
    console.log("nodeID: "+nodeID)
    let waysCount = 0
    let validWays = []
    if(ways.elements.length > 1){
        for(let i=0; i<ways.elements.length; i++){
            // console.log(validWays[i].tags.highway)
            if(wayTags.includes(ways.elements[i].tags.highway)){
                waysCount ++;
                validWays.push(ways.elements[i])
                // validWays.push({ways: ways.elements[i], lat: lat, long: long})
            }
        }
    }
    //check if the names of the roads are all different since different parts of the same road may have different IDs
    if(waysCount > 1){
        for(let i=0; i<validWays.length;i++){
            for(let j=i+1; j<validWays.length;j++){
                if(validWays[i].tags.name==validWays[j].tags.name && validWays[i].tags.name != undefined){
                    validWays.splice(j,1)
                    j--
                }
            }
        }
    }
    // console.log("validWays: "+validWays)
    return validWays;

}


function twoPointDistance(x1,y1,x2,y2){
    let dep = Math.sqrt(Math.pow((x1*100 - x2*100), 2) + Math.pow((y1*100 - y2*100), 2));
    // console.log(x1, x2,y1,y2)
    return dep;
}


