const {randomPoint} = require('@turf/random');
const fs = require('fs');

let aThousandPoints = randomPoint(1000);
fs.writeFileSync('aThousandPoints.geojson', JSON.stringify(aThousandPoints));
