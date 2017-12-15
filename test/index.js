const geojsonVt = require('geojson-vt');
const supercluster = require('supercluster');
const fs = require('fs');
const assert = require('assert');
const {join} = require('path');
// const sinon = require('sinon'); // for stubbing recurse;
// const coverageOf = require('@mapbox/tile-cover');
const Pbf = require('pbf');
const {VectorTile} = require('@mapbox/vector-tile');
const {points, usa} = require('./fixtures/load-geojson.js');
const turf = {...require('@turf/random'), ...require('@turf/helpers')};
const main = require('../src/index.js');
const {getTiles, getBuff, ensureIndexes} = main;
const debug = require('debug');
if (process.env.DEBUG) debug.enable(process.env.DEBUG);

suite('Internals', ()=>{
  suite('getTiles', ()=>{
    test('Gets populated tiles correctly', ()=>{
      const _points = supercluster();
      _points.load(points.features);
      const layerTileMapping = {_points};
      const tileObj = getTiles(layerTileMapping, 1, 0, 0);
      assert.ok(tileObj, `getTiles returned ${JSON.stringify(tileObj)}`);
      let obj = tileObj['_points'];
      assert.ok(obj, 'getTiles(...)[layer] was ' + JSON.stringify(obj));
      obj = obj['features'];
      assert.ok(obj, 'getTiles(...)[layer].features was' + JSON.stringify(obj));
    });
    // getTiles(...) may include null/empty tiles
  });
  suite('getBuff', ()=>{
    test('Encodes populated tiles as PBF', ()=>{
      const _points = supercluster();
      _points.load(points.features);
      const layerTileMapping = {_points};
      const buff = getBuff(layerTileMapping, 1, 0, 0);
      assert.ok(buff, 'getBuff returned something falsy');
      // adapted from
      // https://github.com/mapbox/vt-pbf/blob/master/test/basic.js#L11
      const tile3 = new VectorTile(new Pbf(buff));
      const layer = tile3.layers['_points'];
      let features = [];
      for (let i = 0; i < layer.length; i++) {
        let feat = layer.feature(i).toGeoJSON(0, 0, 1);
        features.push(feat);
      }
      // there are a mix of clusters and empy points...
      assert(features.some((f) => f.properties.cluster), 'no clusters encoded');
    });
    test('Returns null if no features are present in a tile', ()=>{
      const empty = geojsonVt(turf.featureCollection([]));
      const layerTileMapping = {empty};
      const buff = getBuff(layerTileMapping, 1, 0, 0);
      assert(!buff, 'getBuff returned a tile');
    });
  });
  suite('ensureIndexes', ()=>{
    test('Correctly coerces geojson to geojson-vt indexes', ()=>{
      const layerIndexMapping = ensureIndexes({points});
      assert.ok(
        layerIndexMapping.points, 'Oddly, the points layer is not found'
      );
      assert.ok(
        layerIndexMapping.points.getTile, 'the points layer is not a TileIndex'
      );
    });
  });
});

suite('Integration tests', ()=>{
  let _usa;
  let _points;
  setup(function() {
    _usa = geojsonVt(usa, {
      maxZoom: 4 // for timing
    });
    _points = supercluster();
    _points.load(points.features);
  });
  const checkDirectory = (path) => {
    assert(fs.existsSync(path), path + ' is missing');
    let firstLevel = fs.readdirSync(path);
    const checkNumericSubdirectories = (level, index) => {
      let n = index == 'z' ? 2 : 1;
      assert(
        level.length >= n,
        'insufficient subdirectories created @ level ' + index
      );
      assert(
        level.every((subdir) => subdir.match(/^\d+$/)),
        'non-numeric first-level directories detected @ level ' + index
      );
    };
    checkNumericSubdirectories(firstLevel, 'z');
    let secondLevel = fs.readdirSync(join(path, firstLevel[0]));
    checkNumericSubdirectories(secondLevel, 'x');
    let thirdLevel = fs.readdirSync(join(path, firstLevel[0], secondLevel[0]));
    assert(thirdLevel.length, 'no subdirectories created @ level y');
    assert(
      thirdLevel.every((tile) => tile.match(/^\d+\.(pbf|mvt)$/)),
      'a bad tile format was detected among ' + JSON.stringify(thirdLevel)
    );
  };
  test('Saves geojson multipolygons', ()=>{
    const target = join(__dirname, 'output', 'usa');
    return main.init({_usa}, {target})
      .then(()=>checkDirectory(target));
  });
  test('Saves supercluster', ()=>{
    const target = join(__dirname, 'output', 'cluster');
    return main.init({_points}, {target}).then(()=>checkDirectory(target));
  });
  test('can save both', ()=>{
    const target = join(__dirname, 'output', 'ensemble');
    return main.init({_points, _usa}, {target})
      .then(()=>checkDirectory(target));
  });
});
