const geojsonVt = require('geojson-vt');
const vtPbf = require('vt-pbf');
const {getChildren, bboxToTile} = require('@mapbox/tilebelt');
const {existsSync: exists, mkdir, writeFile} = require('fs');
const {join} = require('path');
const bbox = require('@turf/bbox');
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
        data = data || {};
        if (data.getTile && data.getTile.constructor == Function) {
          return {[layerName]: data}; // since it's an index
        } else {
          if ((data.features || data.geometry) && 'type' in data ) {
            return {[layerName]: geojsonVt(data, options)};
          } else {
            throw new Error('unexpected input:', {[layerName]: data});
          }
        }
      })
    .reduce((a, b) => Object.assign(a, b), {});
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
      ([layerName, index]) => {
        let tile = index.getTile(z, x, y);
        const isPopulated = tile && tile.features.length;
        debug('getTiles:isPopulated')(`${isPopulated}:${z}${x}${y}`);
        return isPopulated ? {[layerName]: tile} : {};
      }
    )
    .reduce((a, r)=>Object.assign(a, r), {});
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
  if (Object.keys(tileObj).length) {
    return vtPbf.fromGeojsonVt(tileObj);
  } else {
    debug('getBuff')(tileObj);
  }
}

/**
 * Saves a @see MVT to a target destination.
 * @private
 * @async
 * @param  {MVT} buff
 * @param  {String} target a string in the style of a slippy map tile (e.g
 * 'z/x/y.pbf')
 * @return {Promise} resolves true when done.
 */
function save(buff, target) {
  return new Promise((resolve, reject) =>{
    writeFile(
      target, buff, (err, success) =>{
        if (err) reject(err);
        debug('this:save')(`${target} : success`);
        resolve(true);
      });
  }).catch((err) => debug('this:save')(err));
}

/**
 * Ensures a directory exists.
 * @private
 * @async
 * @param  {String} dir a path to a directory
 * @return {Promise} resolves the directory path when the directory exists.
 */
const ensureDir = (dir) => {
  return new Promise((resolve, reject) => {
    if (exists(dir)) {
      resolve(dir);
    } else {
      mkdir(dir, (err)=>{
        if (err) {
          debug('this:dir:err')(err);
          if (!err.message.match('EEXIST')) {
            debug('this:dir:unknown')(err);
            reject(err);
          }
        }
        resolve(dir);
      });
    }
  }).catch((err) => debug('this:ensureDir')(err));
};

/**
 * saves a protobuf in slippy tile format
 * @async
 * @param  {MVT} buff a protobuf-encoded .mvt tile
 * @param  {Object} options ...
 * @param {String} [options.target='.'] the path to the z/x/y tile directory
 * @param {String} [options.ext='pbf'] the file extension to use on each tile
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @return {Promise} resolves true when done.
 */
function saveBuff(buff, options, z, x, y ) {
  return ensureDir(options.target)
    .then((dir)=>ensureDir(join(dir, `${z}`)))
    .then((dir)=>ensureDir(join(dir, `${x}`)))
    .then((dir)=>save(buff, join(dir, `${y}.${options.ext || 'pbf'}`)));
}

/**
 * Recursively saves the tiles in the indexMapping at and below the input z, x,
 *  y
 * @async
 * @param  {LayerIndexMapping} indexMapping
 * @param  {Object} options @see ensureIndexes#options , with the following
 *   special properties:
 * @param  {String|undefined} [options.ext='pbf'] the file extension with which
 *   to save each tile
 * @param {String|undefined} [options.target='.'] where to store the z/x/y tile
 *   directory
 * @param {Function} [options.save=saveBuff] an optional callback to save each
 *   tile
 * @param  {Number} options.maxZoom the maximum zoom to save
 * @param  {Number} [z=0]  the z-coordinate of the tile
 * @param  {Number} [x=0]  the x-coordinate of the tile
 * @param  {Number} [y=0]  the x-coordinate of the tile
 * @return {Promise} when all the child tiles are saved.
 */
async function recur(indexMapping, options, z=0, x=0, y=0) {
  debug('this:recursion')(
    `processing ${z}/${x}/${y} for ${Object.keys(indexMapping).join()}`
  );
  const save = options.save || saveBuff;
  const buff = getBuff(indexMapping, z, x, y);
  if (buff) {
    await save(buff, options, z, x, y);
    if (z < (options.maxZoom || options.max_zoom || 24) && z < 24) {
      await Promise.all(
        getChildren([x, y, z]).map(
          (child) => {
            let [_x, _y, _z] = child;
            recur(indexMapping, options, _z, _x, _y)
              .catch((err) => debug('this:recur')(err));
          }
        )
      ).catch((err) => debug('this:recur:all')(err));
      const tileId = toId(z, x, y);
      Object.values(indexMapping).forEach(
        (tileIndex) =>{
          if (tileIndex.tiles) delete tileIndex.tiles[tileId];
        }
      );
    } else {
      debug('this:recur')(`reached max zoom @ ${z}`);
    }
  } else {
    debug('this:recur')(
      `no pbf for layers ${Object.keys(indexMapping)} @ ${z}/${x}/${y}`
    );
  }
  return true;
}

/**
 * Generates the id of a tile in a tileIndex. Copied from
 * https://github.com/mapbox/geojson-vt/blob/master/src/index.js#L195
 * @param  {Nubmer} z  the z-index of the tile
 * @param  {Number} x  the x-index of the tile
 * @param  {Number} y  the y-index of the tile
 * @return {Number} the hashed z/x/y id in a geojson-vt tiles object
 */
function toId(z, x, y) {
  return (((1 << z) * y + x) * 32) + z;
}

/**
 * Turns a mapping of layer names to layer tile indexes into a directory
 * of /x/y/z/tile.mvt
 * @async
 * @export
 * @param  {LayerIndexMapping} layerIndexMapping {[layerName]: tileIndex}
 * @param  {Object} options @see ensureIndexes#options
 * @return {Promise} when all recursion has completed.
 */
function storeMvt(layerIndexMapping, options) {
  layerIndexMapping = ensureIndexes(layerIndexMapping, options);
  const initialZXY = {};
  Object.values(layerIndexMapping)
    .forEach(
      (index) => {
        if (index.tileCoords) {
          // tileCoords is an object of
          index.tileCoords.forEach(({x, y, z}) => {
            debug('this:init:tileCoords')(`${z} ${x} ${y}`);
            initialZXY[`${z} ${x} ${y}`] = true;
          });
        } else if (index.points) {
          let area = bbox({type: 'FeatureCollection', features: index.points});
          let [_x, _y, _z] = bboxToTile(area);
          initialZXY[[_z, _x, _y].join(' ')] = true;
        } else {
          console.warn('unexpected non-supercluster, non-geojson-vt index.');
        }
      }
    );
  debug('this:initialzxy')(JSON.stringify(initialZXY));
  const inits = Object.keys(initialZXY)
    .map((str) => str.split(' ').map((numStr) => Number(numStr)));
  return Promise.all(
    inits.map(
      (initialTile) => recur(layerIndexMapping, options, ...initialTile)
        .catch((err) => debug('this:recursion:err')(initialTile))
    )
  ).catch((err) => {
    debug('this:recursion')(err);
    throw err;
  });
}

// export everything important for testing
module.exports = {storeMvt, getTiles, getBuff, saveBuff, ensureIndexes, recur};
