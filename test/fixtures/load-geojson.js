const fs = require('fs');
const {join} = require('path');
const load = (fileName) => JSON.parse(
  fs.readFileSync(join(__dirname, fileName), 'utf8')
);
const points = load( 'aThousandPoints.geojson');
const usa = load('us-states.geojson');
module.exports = {usa, points};
