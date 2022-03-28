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


//     if(lastUserLocation != userLocation){
//         bboxleft = userLocation.longitude - 0.0001;
//         bboxright = userLocation.longitude + 0.0001;
//         bboxbottom = userLocation.latitude - 0.0001;
//         bboxtop = userLocation.latitude + 0.0001;
//     }

//     console.log(bboxleft,bboxright,bboxbottom,bboxtop)

//     https.get(`https://api.openstreetmap.org/api/0.6/map?bbox=${bboxleft},${bboxbottom},${bboxright},${bboxtop}`, (response)=>{
//     let data = ""
//     response.on("data", (chunk)=>{
//         data += chunk
//     })
//     response.on("end", ()=>{
//         // console.log(data)
//         let arrayData =data.split('<')
//         let allNodes = {}
//         // console.log(arrayData)
//         for(let i = 0; i < arrayData.length; i++){
//             if(arrayData[i].includes("node")){
//                 // let jsonData = arrayData[i].replace("=", ":")
//                 // console.log(arrayData[i])
//                 let nodeID = arrayData[i].substring(9, 19)
//                 let nodeLat = arrayData[i].substring(arrayData[i].search("lat=")+5, arrayData[i].indexOf(`"`,arrayData[i].search("lat=")+5))
//                 let nodeLong = arrayData[i].substring(arrayData[i].search("lon=")+5,arrayData[i].indexOf(`"/`,arrayData[i].search("lon=")+5))
//                 allNodes[nodeID] = {"nodeLat": nodeLat, "nodeLong": nodeLong}
//                 // console.log(nodeLat, nodeLong)

//             }
//         }
//         let shortest = 0
//         let closestNode
//         for(let key in allNodes){
//             let distance = twoPointDistance(parseFloat(userLocation.latitude), parseFloat(userLocation.longitude),parseFloat(allNodes[key].nodeLat), parseFloat(allNodes[key].nodeLong))
//             // console.log(distance)
//             allNodes[key].distance = distance
//             if(distance < shortest || shortest == 0){
//                 shortest = distance
//             }
//         }
//         for(let key in allNodes){
//             if(allNodes[key].distance == shortest){
//                 closestNode = key
//             }
//         }
//         console.log(closestNode) 
//         //the node that is closest to the user
//         https.get(`https://www.openstreetmap.org/api/0.6/node/${closestNode}/ways`,(response)=>{
//             let data = ""
//             response.on("data", (chunk)=>{
//                 data += chunk
//             })
//             response.on("end", ()=>{
//                 console.log(data)
//                 // document.write(data)
//             })
//         })
//     })

// })
// }, 10000);

// app.get('/route', async function(req, res)=>{

// })

app.get('/SendLocation', async function(req, res) {
    let lat = parseFloat(req.query.lat);
    let long = parseFloat(req.query.long);
  
  console.log("lat= "+lat + "long = "+long)
    
    let bboxleft, bboxright,bboxbottom, bboxtop
    // if(lastUserLocation != userLocation){
        bboxleft = long - 0.00015;
        bboxright = long + 0.00015;
        bboxbottom = lat - 0.00015;
        bboxtop = lat + 0.00015;
        // }

    //console.log(bboxleft,bboxright,bboxbottom,bboxtop)

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

        https.get(`https://www.openstreetmap.org/api/0.6/node/${closestNode}/ways`,(response)=>{
            let data = ""
            response.on("data", (chunk)=>{
                data += chunk
            })
            response.on("end", ()=>{
                // console.log(data)
                // res.json(data);
            })
        })

        https.get("https://www.openstreetmap.org/api/0.6/node/103990314/ways", (response)=>{
            let data = ""
            let crossroads = []

            response.on("data", (chunk)=>{
                data += chunk
            })
            response.on("end", ()=>{
                let arrayData =data.split('<')
                
                // console.log(arrayData)
                for(let i = 0; i < arrayData.length; i++){
                    if(arrayData[i].includes("nd ref=")){
                        let nodeID = arrayData[i].substring(arrayData[i].search("ref=")+5, arrayData[i].indexOf(`"/`,arrayData[i].search("ref=")+5))
                        // console.log(nodeID)
                        // https.get(`https://www.openstreetmap.org/api/0.6/node/${nodeID}/ways`,(response)=>{
                        //     let data1 = ""
                        //     response.on("data", (chunk)=>{
                        //         data1 += chunk
                        //     })
                        //     response.on("end",()=>{
                        //         // console.log(data1+"-------------------")
                        //         var pos = 0;
                        //         var num = -1;
                        //         var i = -1;
                                
                        //         // Search the string and counts the number of e's
                        //         while (pos != -1) {
                        //             pos = data1.indexOf(`tag k="name"`, i + 1);
                        //             num += 1;
                        //             i = pos;
                        //         }
                        //         // console.log("there are "+num+" roads through this node")
                        //         if(num >1){
                        //             crossroads.push(nodeID)
                        //         }
                        //     })
                        // })

                        getCrossRoads(nodeID)
                        // allNodes[nodeID] = {"nodeLat": nodeLat, "nodeLong": nodeLong}
                    }

                }
        
            })
            //how to have a function that only execute after all the requests are done??
            setTimeout(function(){
                console.log("crossroads: "+crossroads)
                let nodeIndex = Math.floor(Math.random() * crossroads.length)
                let nextNode = crossroads[nodeIndex]
                console.log(nextNode)
            },3000)
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

async function getCrossRoads(nodeID){
    let ways = await getWays(nodeID)
    console.log("nodeID: "+nodeID)
    // console.log(ways.elements.length)
    let waysCount = 0
    let validWays = []
    if(ways.elements.length > 1){
        for(let i=0; i<ways.elements.length; i++){
            for(let j=0; j<validWays.length;j++){
                if(ways.elements[i].tags.name == validWays[j].tags.name){
                    return
                }
            }
        validWays.push(ways.elements[i])
        console.log(ways.elements[i].tags.name)
        }
    }
    if(ways.elements.length > 1){
        for(let i=0; i<ways.elements.length; i++){
            // console.log(ways.elements[i].tags.highway)
            if(wayTags.includes(ways.elements[i].tags.highway)){
                waysCount ++;
            }
        }
    }
    if(waysCount > 1){

    }

}


function twoPointDistance(x1,y1,x2,y2){
    let dep = Math.sqrt(Math.pow((x1*100 - x2*100), 2) + Math.pow((y1*100 - y2*100), 2));
    // console.log(x1, x2,y1,y2)
    return dep;
}









// nodeID: 103990314
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 9297965068
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 1007860942,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 1,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//       9297965064,
//       9297965069,
//       9297965065,
//       9297965066,
//       9297965068,
//       9297965067
//     ],
//     tags: { crossing: 'marked', footway: 'crossing', highway: 'footway' }
//   }
// ]
// nodeID: 2800360229
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 275404745,
//     timestamp: '2014-04-19T05:39:03Z',
//     version: 1,
//     changeset: 21790610,
//     user: 'AddisWang',
//     uid: 2036923,
//     nodes: [
//       2800360216,
//       2800360223,
//       2800360224,
//       2800360225,
//       2800360226,
//       2800360227,
//       2800360228,
//       2800360229
//     ],
//     tags: { highway: 'service' }
//   }
// ]
// nodeID: 3767103010
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 373200839,
//     timestamp: '2016-02-03T14:15:56Z',
//     version: 2,
//     changeset: 36978088,
//     user: 'zzcolin',
//     uid: 527986,
//     nodes: [
//        115460110, 3767103023,
//       3767103020, 3767103018,
//       3767103015, 3767103013,
//       3767103010, 3767103009,
//        115491561
//     ],
//     tags: { highway: 'primary_link', oneway: 'yes' }
//   }
// ]
// nodeID: 602741359
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 613874579,
//     timestamp: '2021-07-25T09:03:06Z',
//     version: 5,
//     changeset: 108557169,
//     user: 'chaircheese',
//     uid: 12185235,
//     nodes: [
//       5807580370,   91133357,   94430726,
//       1930275746, 1930275750,   84465104,
//       7099150440,   93392848, 7099150479,
//         93393102,  602741359, 2800360259,
//       2800363851,   84465105, 1930275779,
//         84465106, 1930275783,   84465107,
//         84465108,   93393316
//     ],
//     tags: {
//       highway: 'tertiary',
//       lanes: '2',
//       name: '枣庄路',
//       'name:en': 'Zaozhuang Road',
//       oneway: 'yes'
//     }
//   }
// ]
// nodeID: 3767102977
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
//check this
// nodeID: 602741361
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 39962682,
//     timestamp: '2012-08-29T10:05:24Z',
//     version: 8,
//     changeset: 12903092,
//     user: 'zzcolin',
//     uid: 527986,
//     nodes: [
//        602741361,  602741362,
//        127443184, 1887980313,
//       1887980311, 1887980310,
//       1887980309, 1887980303
//     ],
//     tags: { highway: 'residential', name: '金口路', 'name:en': 'Jinkou Road' }
//   },
//   {
//     type: 'way',
//     id: 47323588,
//     timestamp: '2021-07-02T14:21:11Z',
//     version: 7,
//     changeset: 107315527,
//     user: 'chaircheese',
//     uid: 12185235,
//     nodes: [
//       602741361,
//       103988991,
//       8887906449,
//       602741364,
//       602741366,
//       8887906448,
//       8887905672
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 624790908
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 303324258,
//     timestamp: '2018-11-10T14:15:25Z',
//     version: 6,
//     changeset: 64352990,
//     user: 'jc86035',
//     uid: 1242214,
//     nodes: [
//        115459752, 3763448690,  115459796, 3767103054,
//       3767103048,  115459924, 3767103041,  115460058,
//       3767103029,  115460110,  115460336,  103992442,
//        624790908,  115491545,  103990375, 5804603465,
//       5804603466, 3767102985,  616288181,  103990412,
//       3767102973, 3767102966,  103990445,  105329634,
//        103990483, 3767102633, 3767102626, 3767102625,
//       3767712989, 3767712987, 3767712978,  103990510,
//        103990629,  103990741,  826648532, 3767712957,
//       3767711253, 3773318278,  103992240, 3773318263,
//       3773318261,  105339554,  103992313, 3767711244,
//        614397838, 3767711240,  624793356,  111138563,
//        111138481
//     ],
//     tags: {
//       highway: 'primary',
//       int_name: 'Jinqiao Lu',
//       name: '金桥路',
//       'name:en': 'Jinqiao Road',
//       'name:zh': '金桥路',
//       'name:zh-Hant': '金橋路',
//       'name:zh_pinyin': 'Jīnqiáo Lù',
//       oneway: 'yes'
//     }
//   },
//   {
//     type: 'way',
//     id: 373200838,
//     timestamp: '2016-02-03T14:15:56Z',
//     version: 2,
//     changeset: 36978088,
//     user: 'zzcolin',
//     uid: 527986,
//     nodes: [
//       3767102997, 3767102994,
//       3767102995, 3767102998,
//       3767103003, 3767103005,
//       3767103006, 3767103007,
//        624790908
//     ],
//     tags: { highway: 'primary_link', oneway: 'yes' }
//   }
// ]
// nodeID: 602741360
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 182669307,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 2,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//         93392306, 9297965061,
//         93392313,   93393251,
//         93392632,   93392665,
//       1930275781, 9297965060,
//         93392676, 1930275777,
//         93392753,  602741360,
//         93393035,   93392933,
//         93392776,   94430800,
//         93392791
//     ],
//     tags: { highway: 'cycleway' }
//   }
// ]
// nodeID: 1930275772
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 182669301,
//     timestamp: '2022-02-04T13:16:00Z',
//     version: 9,
//     changeset: 117006334,
//     user: 'Oke Ris',
//     uid: 7752211,
//     nodes: [
//         93393293,   93390919,
//         93390957, 1930275782,
//       2800377787,   93390966,
//       1930275778,   93390975,
//       1930275772,   93393042,
//         93392869,  105329689,
//       1930275748, 1930275744,
//         94430743,   93391081,
//       9474267882,   93391091
//     ],
//     tags: {
//       highway: 'tertiary',
//       lanes: '2',
//       name: '枣庄路',
//       'name:en': 'Zaozhuang Road',
//       oneway: 'yes'
//     }
//   }
// ]
// nodeID: 103994019
// [
//   {
//     type: 'way',
//     id: 11641454,
//     timestamp: '2018-08-02T17:12:59Z',
//     version: 13,
//     changeset: 61305089,
//     user: 'zzcolin',
//     uid: 527986,
//     nodes: [
//        115461379, 3763448689,  115461620,
//       3767103053, 3767103047,  115461751,
//       3767103040,  115461857, 3767103032,
//       3767103028, 3767103022,  115461958,
//       3767103014,  115462112, 3767103008,
//        103994019,  103994115,  103994155,
//        115491621,  103994193, 3767102988,
//       3767102984, 3767102974,  103994224,
//       3767102961, 5804603470, 3767102958,
//       5804603471,  103994253, 5804603469,
//        105329612,  103994367, 3767102629,
//       5804603468
//     ],
//     tags: { highway: 'cycleway', oneway: 'yes' }
//   },
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 476567579
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 476567031
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 103993571
// [
//   {
//     type: 'way',
//     id: 11766106,
//     timestamp: '2022-01-31T12:30:56Z',
//     version: 11,
//     changeset: 116821657,
//     user: 'daiSG',
//     uid: 2286509,
//     nodes: [
//         70976072,   88081526,   70976070, 3767711246,
//        826648712, 3773318265, 3773318267, 3773318280,
//        826648794,  103992746, 3767712958, 3767712960,
//        826648728, 3767712966,  103992951,  103992986,
//        103993026, 3767712981, 3767102627, 3767712997,
//       3767102634,  616288172,  616288235,  103993145,
//        105329654,  103993861, 3767102982,  103993217,
//       3767102992, 3767102997, 3767103000,  103993491,
//        115491561,  103993571,  103993670,  115460371,
//        115460411,  115460528, 3767103038, 3767103044,
//        115460570, 3767103050, 3767103052, 3767103056,
//       3763448688, 9463060679, 3763448695
//     ],
//     tags: {
//       highway: 'primary',
//       int_name: 'Jinqiao Lu',
//       name: '金桥路',
//       'name:en': 'Jinqiao Road',
//       'name:zh': '金桥路',
//       'name:zh-Hant': '金橋路',
//       'name:zh_pinyin': 'Jīnqiáo Lù',
//       oneway: 'yes'
//     }
//   },
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 47324211,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 6,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [ 602749123, 3767103024, 9297965076, 103995451, 103993571 ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨北路',
//       'name:en': 'North Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
// nodeID: 2800360217
// [
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   },
//   {
//     type: 'way',
//     id: 275404742,
//     timestamp: '2014-04-19T05:39:03Z',
//     version: 1,
//     changeset: 21790610,
//     user: 'AddisWang',
//     uid: 2036923,
//     nodes: [
//       2800360213,
//       2800360214,
//       2800360218,
//       2800360215,
//       2800360216,
//       2800360217
//     ],
//     tags: { highway: 'service' }
//   }
// ]
// nodeID: 1930275773
// [
//   {
//     type: 'way',
//     id: 12651995,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 8,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//         93391211, 1930275742,   93391232,
//       7099150439,   93392830, 7099150481,
//       7099150478,   93393182, 1930275773,
//       9297965057, 9297965058,   93391250,
//       1930275780,   93391268, 9297965062,
//       1930275785,   93391291,   93391942,
//         93393451,   93391953, 9297965059,
//         93392030
//     ],
//     tags: { highway: 'cycleway' }
//   },
//   {
//     type: 'way',
//     id: 39753246,
//     timestamp: '2021-12-01T01:25:44Z',
//     version: 12,
//     changeset: 114423708,
//     user: 'Maps Man',
//     uid: 10216874,
//     nodes: [
//        103993571, 3767103010,
//        624790908,  103994019,
//       9297965068,  476567579,
//       3767102977,  103990314,
//       2800360217,  476567031,
//       2800360229, 1930275773,
//        602741359, 1930275772,
//        602741360,  602741361
//     ],
//     tags: {
//       highway: 'secondary',
//       lanes: '4',
//       layer: '0',
//       name: '张杨路',
//       'name:en': 'Zhangyang Road',
//       oneway: 'yes',
//       source: 'interpolation'
//     }
//   }
// ]
