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
/**
 * [ensureIndexes description]
 * @param  {[type]} layerIndexMapping [description]
 * @param  {[type]} options           [description]
 * @return {[type]}                   [description]
 */
function ensureIndexes(layerIndexMapping, options) {
  return Object.entries(layerIndexMapping)
    .map(([layerName, data]) => {
      if (data.getTile && data.getTile.constructor == Function) {
        return data; // since it's an index
      } else {
        if ((index.features || index.geometry) && 'type' in index ) {
          return geojsonVt(data, options);
        } else {
          throw new Error('unexpected input:', {[layerName]: index});
        }
      }
    });
}

/**
 * [anyFeatures description]
 * @param  {[type]} layerTileMapping [description]
 * @return {[type]}                  [description]
 */
function anyFeatures(layerTileMapping) {
  return Object.values(layerTileMapping)
    .some((tile) => tile.features.length > 0);
}

/**
 * Gets a tile at given coordinates from each input tileIndex
 * @param  {Object} layerIndexMapping {[layerName]: tileIndex}
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @return {Object} {[layerName]: geojson-vt-style tile}
 */
function getTiles(layerIndexMapping, z, x, y) {
  return Object.entries(layerIndexMapping)
    .map(
      ([layerName, index]) =>{
        return {[layerName]: index.getTile(z, x, y)};
      }
    )
    .reduce(Object.assign, {});
}

/**
 * Returns the non-empty pbf tile at coordinates z, x, y
 * @param  {Object} layerIndexMapping An object mapping layer names to tile
 *  indexes
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @return {protobuf|undefined} the non-empty mvt (now a protobuf) or undefined
 * if the tile(s) at these coordinates are empty
 */
function getBuff(layerIndexMapping, z, x, y) {
  const tileObj = getTiles(layerIndexMapping, z, x, y);
  if (anyFeatures(tileObj)) {
    return vtPbf.fromGeojsonVt(tileObj);
  }
}

/**
 * Saves a file to a target
 * @private
 * @param  {protobuf} buff   [description]
 * @param  {String} target a string in the style of a slippy map tile (e.g
 * 'z/x/y.pbf')
 */
function save(buff, target) {
  fs.writeFile(
    target, buff, (err, success) =>{
      if (err) throw err;
      debug('save')(`${target} : success`);
    }
  );
}

/**
 * saves a protobuf in slippy tile format
 * @param  {protobuf} buff a protobuf-encoded .mvt tile
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @param  {String} [ext='pbf'] the file extension to use on each tile
 */
function saveBuff(buff, z, x, y, ext='pbf') {
  dir = join(z, x);
  if (exists(dir)) {
    save(buff, join(dir, `${y}.${ext}`));
  } else {
    mkdir(dir, (err, success)=>{
      if (err) throw err;
      save(buff, dir, y);
    });
  }
}

/**
 * Recursively saves the tiles in the indexMapping at and below the input z, x,
 *  y
 * @param  {Object} indexMapping an indexMapping
 * @param  {Object} options      [description]
 * @param  {String|undefined} [options.ext='pbf'] the file extension with which
 * to save each tile
 * @param  {Number} options.maxZoom the maximum zoom to save
 * @param  {Number} [z=0]  the z-coordinate of the tile
 * @param  {Number} [x=0]  the x-coordinate of the tile
 * @param  {Number} [y=0]  the x-coordinate of the tile
 */
function recurse(indexMapping, options, z=0, x=0, y=0) {
  const buff = getBuff(indexMapping, z, x, y);
  if (buff) {
    saveBuff(buff, z, x, y, options.ext || 'pbf');
    if (z < (options.maxZoom || options.max_zoom) && z < 24) {
      getChildren(z, x, y).forEach(
        (child) => {
          recurse(index, ...child);
        }
      );
    }
  }
}

/**
 * Turns a mapping of layer names to layer tile indexes into a directory
 * of /x/y/z/tile.mvt
 * @param  {Object} layerIndexMapping {[layerName]: tileIndex}
 * @param  {Object} options the options object supplied to supercluster or
 * geojson-vt
 */
function init(layerIndexMapping, options) {
  layerIndexMapping = ensureIndexes(layerIndexMapping, options);
  const initialZXY = {};
  Object.values(layerIndexMapping)
    .forEach(
      ({tileCoords}) => initialZXY[tileCoords.join(' ')] = true
    );
  const inits = Object.values(initialZXY).map((str) => str.split(' '));
  for (let init of inits) {
    recurse(layerIndexMapping, ...init);
  }
}
// TODO: rename init to something descriptive
// export everything important for testing
module.exports = {init, getTiles, getBuff, saveBuff, ensureIndexes, recurse};
