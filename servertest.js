// note this needs "npm install node-fetch@2"
let fetch = require('node-fetch');


async function getWays(id) {
	let response = await fetch('https://www.openstreetmap.org/api/0.6/node/' + id + '/ways.json');
    return await response.json();
}


async function test() {
	let ways = await getWays(103990314);
	console.log(ways);
}


test();