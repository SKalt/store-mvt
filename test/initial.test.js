const geojsonVt = require('geojson-vt');
const supercluster = require('supercluster');
const fs = require('fs');
const assert = require('assert');
const {join} = require('path');
// const sinon = require('sinon'); // for stubbing recurse;
// const coverageOf = require('@mapbox/tile-cover');
const Pbf = require('pbf');
const {VectorTile} = require('@mapbox/vector-tile');
const {points/* , usa*/} = require('./fixtures/load-geojson.js');
const turf = {...require('@turf/random'), ...require('@turf/helpers')};
const main = require('../src/index.js');
const {getTiles, getBuff, ensureIndexes} = main;

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
  // suite('recurse', ()=>{
  //   test('recurs correctly', ()=>{
  //       // sinon.stub()
  //   });
  //   test('deletes completed tiles correctly', ()=>{
  //     //
  //   });
  // });
});

suite('Integration tests', ()=>{
  let usa;
  let points;
  // make assertions about the resulting filestructure here
  // /**
  //  * Asserts all of the coordinates input represent tiles.
  //  * @param  {String} target the target directory in ../output to search
  //  * @param  {String} [ext='pbf'] the file extension to expect on each tile.
  //  * @param  {Object.<Number,Number,Number>[]|Array[Number[]]} coordinates An
  //  array of {z, x, y} or [z, x, y] coordinates
  //  */
  // const fileFormatIsCorrect = (target, ext, ...coordinates) =>{
  //   const tilePath = (coordinates) => join(__dirname, 'output', target);
  //
  // }
  setup(function() {
    usa = geojsonVt(usa, {
      maxZoom: 14
    });
    points = supercluster(points, {});
  });
  test('Saves geojson multipolygons', ()=>{
    init({usa}, {target: 'output/usa'});
    assert(fs.existsSyc(join('output', 'usa')));
  });
  test('Saves supercluster', ()=>{
    init({points}, {target: join('output', 'cluster')});
    assert(fs.existsSync(join('output', 'cluster')));
  });
});
