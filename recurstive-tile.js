const geojsonVt = require('@mapbox/geojson-vt');
const vtPbf = require('@mapbox/vt-pbf');
const {getChildren} = require('@mapbox/tilebelt');
// const cover = require('@mapbox/tile-cover');
const {exists, mkdir} = require('fs');
const {join} = require('path');
const debug = require('debug');

// layername:geojson || layerName:index -> register indexes
// for each zoom min->max,
//   if any features in any tile @ this z/x/y, recurse on children.

function ensureIndexes(layerIndexMapping, options){
  return Object.entries(layerIndexMapping)
    .map(([layerName, data]) => {
      if (data.getTile && data.getTile.constructor == Function) {
        return data; // since it's an index
      } else {
        if ((index.features || index.geometry) && 'type' in index ){
          return geojsonVt(data, options);
        } else {
          throw new Error('unexpected input:', {[layerName]:index});
        }
      }
    }
}

function anyFeatures(layerTileMapping){
  return Object.values(layerTileMapping).some(tile => tile.features.length > 0);
}

function getTiles(layerIndexMapping, z, x, y){
  return Object.entries(layerIndexMapping)
    .map(
      ([layerName, index]) =>{
        return {[layerName]: index.getTile(z, x, y)};
      };
    )
    .reduce(Object.assign, {});
}

function getBuff(layerIndexMapping, z, x, y){
  const tileObj = getTiles(layerIndexMapping, z, x, y);
  if (anyFeatures(tileObj)){
    return vtPbf.fromGeojsonVt(tileObj);
  }
}

function save(buff, target){
  fs.writeFile(
    target, buff, (err, success) =>{
      if (err) throw err;
      debug('save')(`${target} : success`);
    }
  );
}

function saveBuff(buff, z, x, y, ext='pbf'){
  dir = path.join(z, x);
  if (exists(dir)){
    save(buff, path.join(dir, `${y}.${ext}`));
  } else {
    mkdir(dir, (err, success)=>{
      if (err) throw err;
      save(buff, dir, y);
    }));
  }
}

function recurse(indexMapping, options, z=0, x=0, y=0){
  const buff = getBuff(indexMapping, z, x, y);
  if (buff){
    saveBuff(buff, z, x, y, options.ext || 'pbf');
    if (z < (options.maxZoom || options.max_zoom) && z < 24){
      tilebelt.getChildren(z, x, y).forEach(
        child => {
          recurse(index, ...child);
        }
      )
    }
  }
}

function init(layerIndexMapping, options){
  layerIndexMapping = ensureIndexes(layerIndexMapping, options);
  const initialZXY =  {};
  Object.values(layerIndexMapping)
    .forEach(
      ({tileCoords}) => initialZXY[tileCoords.join(' ')] = true
  );
  const inits = Object.values(initialZXY).map(str => str.split(' '));
  for (let init of inits){
    recurse(layerIndexMapping, ...inits);
  }
}
