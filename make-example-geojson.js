const {randomPoint} = require('@turf/random');
const fs = require('fs');

let aMillionPoints = randomPoint(1000000);
fs.writeFileSync('aMillionPoints.geojson', JSON.stringify(aMillionPoints));
