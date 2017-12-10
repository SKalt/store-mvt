const geojsonVt = require('geojson-vt');
const supercluster = require('supercluster');
const {randomPoint} = require('@turf/random');
const {bbox} = require('@turf/measurement');
const {bboxToTile, getChildren} = require('@mapbox/tilebelt');

function getInitialTiles(points, {minZoom}){
  const bb = bbox(points);
  const recurse = (tile) => {
    const children = getChildren(tile);
    const results = [];
    children.forEach(
      child => child[0] >= minzoom
        ? results.push(child)
        : results.concat(recurse(child))
    );
    return results;
  };
  return recurse(bboxToTile(bb));
}

function recurse(index, options){
  const index = geojsonVt(pointsCollection, options);
  for (let i=0; i < index.tiles.length; i++){

  }
}
