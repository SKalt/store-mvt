const geojsonVt = require('geojson-vt');
const supercluster = require('supercluster');
const {randomPoint} = require('@turf/random');
const {bbox} = require('@turf/measurement');
const {bboxToTile, getChildren} = require('@mapbox/tilebelt');

/**
 * Returns the minimum zoom tile coordinates for the given points
 * @param  {[type]} points  [description]
 * @param  {[type]} minZoom [description]
 * @return {[type]}         [description]
 */
function getInitialTiles(points, {minZoom}) {
  const bb = bbox(points);
  const recurse = (tile) => {
    const children = getChildren(tile);
    const results = [];
    children.forEach(
      (child) => child[0] >= minzoom
        ? results.push(child)
        : results.concat(recurse(child))
    );
    return results;
  };
  return recurse(bboxToTile(bb));
}

/**
 * Saves tile clusters
 * @param  {[type]} index        [description]
 * @param  {[type]} initialTiles [description]
 * @param  {[type]} maxZoom      [description]
 */
function getAllTiles(index, initialTiles, maxZoom) {
  initialTiles.forEach((zxy) => {
    const tile = index.getTile(...zxy);
    if (tile.features.length) {
      save(tile, zxy);
      getAllTiles(
        index,
        getChildren(zxy).filter(([z, x, y]) => z <= maxZoom),
        maxZoom
      );
    }
  });
}
