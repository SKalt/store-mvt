const geojsonVt = require('@mapbox/geojson-vt');
const vtPbf = require('@mapbox/vt-pbf');
const {getChildren} = require('@mapbox/tilebelt');
const {exists, mkdir} = require('fs');
const {join} = require('path');
const debug = require('debug');

/**
 * A datastructure indexing geospatial objects that outputs tiles via a
 * getTile method.  @see {@link https://github.com/mapbox/geojson-vt#usage}
 * @interface TileIndex
 */

/**
 * Gets a tile at coordinates z, x, y
 * @name getTile
 * @memberof TileIndex
 * @method
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @return {Tile} a geojson-vt-compatible JSON tile object
 */

/**
 * A mapping of layer names to [TileIndexes]{@link TileIndex}.
 * @typedef LayerIndexMapping
 * @property {TileIndex} *layerName a tile index that represents a layer in the
 * resulting tileset
 */

/**
 * A mapping of layer names to @see Tiles at a given z, x, y.
 * @typedef LayerTileMapping
 * @property {Tile}
 */

/**
 * @typedef MVT a profobuf-encoded @see Tile
 */

/**
 * Ensures any geojson layers input are turned into
 * [TileIndexes]{@link TileIndex}
 * @param  {Object} layerIndexMapping where layers may be either geojson or
 *  [TileIndexes]{@link TileIndex}
 * @param  {Object} [options={}] Options for geojson-vt to parse a geojson
 *   dataset. @see https://github.com/mapbox/geojson-vt#options
 * @return {LayerIndexMapping}
 */
function ensureIndexes(layerIndexMapping, options={}) {
  return Object.entries(layerIndexMapping)
    .map(
      ([layerName, data]) => {
        if (data.getTile && data.getTile.constructor == Function) {
          return {[layerName]: data}; // since it's an index
        } else {
          if ((index.features || index.geometry) && 'type' in index ) {
            return {[layerName]: geojsonVt(data, options)};
          } else {
            throw new Error('unexpected input:', {[layerName]: index});
          }
        }
      })
    .reduce((a, b) => Object.assign(a, b), {});
}

/**
 * Checks whether any tiles contain features
 * @param  {LayerTileMapping} layerTileMapping
 * @return {Boolean} Whether any tiles contain features
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
 * @return {LayerTileMapping}
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
 * @param  {LayerIndexMapping} layerIndexMapping An object mapping layer names
 *   to tile indexes
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
 * Saves a @see MVT to a target destination.
 * @private @ignore
 * @param  {MVT} buff
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
 * @param  {MVT} buff a protobuf-encoded .mvt tile
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @param  {Object} options ...
 * @param {String} [options.path='.'] the path to the z/x/y tile directory
 * @param {String} [options.ext='pbf'] the file extension to use on each tile
 */
function saveBuff(buff, z, x, y, options) {
  dir = join(options.path || '', z, x);
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
 * @param  {LayerIndexMapping} indexMapping
 * @param  {Object} options @see ensureIndexes#options , with the following
 *   special properties:
 * @param  {String|undefined} [options.ext='pbf'] the file extension with which
 *   to save each tile
 * @param {String|undefined} [options.path='.'] where to store the z/x/y tile
 *   directory
 * @param  {Number} options.maxZoom the maximum zoom to save
 * @param  {Number} [z=0]  the z-coordinate of the tile
 * @param  {Number} [x=0]  the x-coordinate of the tile
 * @param  {Number} [y=0]  the x-coordinate of the tile
 */
function recurse(indexMapping, options, z=0, x=0, y=0) {
  const buff = getBuff(indexMapping, z, x, y);
  if (buff) {
    saveBuff(buff, z, x, y, options);
    if (z < (options.maxZoom || options.max_zoom || 24) && z < 24) {
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
 * @param  {LayerIndexMapping} layerIndexMapping {[layerName]: tileIndex}
 * @param  {Object} options @see ensureIndexes#options
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
