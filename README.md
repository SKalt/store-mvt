# store-mvt

![Travis-ci build status](https://travis-ci.org/SKalt/store-mvt.svg?branch=master)
![npm version](https://badge.fury.io/js/store-mvt.svg)

> A module to slice and store [mapbox vector tiles (.mvt)](https://www.mapbox.com/vector-tiles/specification) from within Node.js.

## Installation
from npm : `npm install [--save[-dev]] store-mvt`

from github:
```
git clone https://github.com/SKalt/store-mvt.git path/to/target/dir
// to use it
const {storeMvt} = require('path/to/target/dir/src/index.js');
```

## usage
```{js}
const toMvt = require('store-mvt');
const geojsonVt = require('geojson-vt');
const supercluster = require('supercluster');

const clusterIndex = supercluster(/* options */);
clusterIndex.load(/* a giant array of geojson point features */);
const geojsonIndex = geojsonVt(/* geojson, options*/);

// save the .mvt pyramid to a directory:
toMvt(
  {layer_name: clusterIndex, other_layer_name: geojsonIndex},
  {//options
    ext: '.pbf' // the file extension to use for each tile,
    target: './pyramid', // a path to a directory to store the z/x/y tiles
  }
).then(()=>console.log('done!'));
```
### How it works
It recursively slices tiles from an input min to max zoom.

### Related tools
- [PostGIS's `ST_AsMVT`](/https://postgis.net/docs/ST_AsMVT.html) creates `.mvt` pyramids like this does.
- [`tippecanoe`](https://github.com/mapbox/tippecanoe) intelligently compresses
geojson to `.mbtiles`
- [`mbutil`/`mb-util`](https://github.com/mapbox/mbutil) stores directories of `.mvt` like `store-mvt` outputs as `.mbtiles`


## development
Contributions are welcome!
