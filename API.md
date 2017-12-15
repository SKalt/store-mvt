## Modules

<dl>
<dt><a href="#module_store-mvt">store-mvt</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#recur">recur</a> ⇒ <code>Promise</code></dt>
<dd><p>Recursively saves the tiles in the indexMapping at and below the input z, x,
 y</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#_toConsumableArray">_toConsumableArray(z, x, y)</a> ⇒ <code>Number</code></dt>
<dd><p>Generates the id of a tile in a tileIndex. Copied from
<a href="https://github.com/mapbox/geojson-vt/blob/master/src/index.js#L195">https://github.com/mapbox/geojson-vt/blob/master/src/index.js#L195</a></p>
</dd>
</dl>

<a name="module_store-mvt"></a>

## store-mvt

* [store-mvt](#module_store-mvt)
    * [~TileIndex](#module_store-mvt..TileIndex)
    * [~ensureIndexes(layerIndexMapping, [options])](#module_store-mvt..ensureIndexes) ⇒ <code>LayerIndexMapping</code>
    * [~getTiles(layerIndexMapping, z, x, y)](#module_store-mvt..getTiles) ⇒ <code>LayerTileMapping</code>
    * [~getBuff(layerIndexMapping, z, x, y)](#module_store-mvt..getBuff) ⇒ <code>protobuf</code> \| <code>undefined</code>
    * [~saveBuff(buff, z, x, y, options)](#module_store-mvt..saveBuff) ⇒ <code>Promise</code>
    * [~storeMvt(layerIndexMapping, options)](#module_store-mvt..storeMvt) ⇒ <code>Promise</code>
    * [~LayerIndexMapping](#module_store-mvt..LayerIndexMapping)
    * [~LayerTileMapping](#module_store-mvt..LayerTileMapping)
    * [~MVT](#module_store-mvt..MVT)

<a name="module_store-mvt..TileIndex"></a>

### store-mvt~TileIndex
A datastructure indexing geospatial objects that outputs tiles via a
getTile method.  @see [https://github.com/mapbox/geojson-vt#usage](https://github.com/mapbox/geojson-vt#usage)

**Kind**: inner interface of [<code>store-mvt</code>](#module_store-mvt)  
<a name="module_store-mvt..ensureIndexes"></a>

### store-mvt~ensureIndexes(layerIndexMapping, [options]) ⇒ <code>LayerIndexMapping</code>
Ensures any geojson layers input are turned into
[TileIndexes](TileIndex)

**Kind**: inner method of [<code>store-mvt</code>](#module_store-mvt)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| layerIndexMapping | <code>Object</code> |  | where layers may be either geojson or  [TileIndexes](TileIndex) |
| [options] | <code>Object</code> | <code>{}</code> | Options for geojson-vt to parse a geojson   dataset. @see https://github.com/mapbox/geojson-vt#options |

<a name="module_store-mvt..getTiles"></a>

### store-mvt~getTiles(layerIndexMapping, z, x, y) ⇒ <code>LayerTileMapping</code>
Gets a tile at given coordinates from each input tileIndex

**Kind**: inner method of [<code>store-mvt</code>](#module_store-mvt)  

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | <code>Object</code> | {[layerName]: tileIndex} |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

<a name="module_store-mvt..getBuff"></a>

### store-mvt~getBuff(layerIndexMapping, z, x, y) ⇒ <code>protobuf</code> \| <code>undefined</code>
Returns the non-empty pbf tile at coordinates z, x, y

**Kind**: inner method of [<code>store-mvt</code>](#module_store-mvt)  
**Returns**: <code>protobuf</code> \| <code>undefined</code> - the non-empty mvt (now a protobuf) or undefined
if the tile(s) at these coordinates are empty  

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | <code>LayerIndexMapping</code> | An object mapping layer names   to tile indexes |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

<a name="module_store-mvt..saveBuff"></a>

### store-mvt~saveBuff(buff, z, x, y, options) ⇒ <code>Promise</code>
saves a protobuf in slippy tile format

**Kind**: inner method of [<code>store-mvt</code>](#module_store-mvt)  
**Returns**: <code>Promise</code> - resolves true when done.  
**Async**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| buff | <code>MVT</code> |  | a protobuf-encoded .mvt tile |
| z | <code>Nubmer</code> |  | the z-index of the tile |
| x | <code>Number</code> |  | the x-index of the tile |
| y | <code>Number</code> |  | the y-index of the tile |
| options | <code>Object</code> |  | ... |
| [options.target] | <code>String</code> | <code>&#x27;.&#x27;</code> | the path to the z/x/y tile directory |
| [options.ext] | <code>String</code> | <code>&#x27;pbf&#x27;</code> | the file extension to use on each tile |

<a name="module_store-mvt..storeMvt"></a>

### store-mvt~storeMvt(layerIndexMapping, options) ⇒ <code>Promise</code>
Turns a mapping of layer names to layer tile indexes into a directory
of /x/y/z/tile.mvt

**Kind**: inner method of [<code>store-mvt</code>](#module_store-mvt)  
**Returns**: <code>Promise</code> - when all recursion has completed.  
**Async**:   
**Export**:   

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | <code>LayerIndexMapping</code> | {[layerName]: tileIndex} |
| options | <code>Object</code> | @see ensureIndexes#options |

<a name="module_store-mvt..LayerIndexMapping"></a>

### store-mvt~LayerIndexMapping
A mapping of layer names to [TileIndexes](TileIndex).

**Kind**: inner typedef of [<code>store-mvt</code>](#module_store-mvt)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| *layerName | <code>TileIndex</code> | a tile index that represents a layer in the resulting tileset |

<a name="module_store-mvt..LayerTileMapping"></a>

### store-mvt~LayerTileMapping
A mapping of layer names to @see Tiles at a given z, x, y.

**Kind**: inner typedef of [<code>store-mvt</code>](#module_store-mvt)  
**Properties**

| Type |
| --- |
| <code>Tile</code> | 

<a name="module_store-mvt..MVT"></a>

### store-mvt~MVT
**Kind**: inner typedef of [<code>store-mvt</code>](#module_store-mvt)  
<a name="recur"></a>

## recur ⇒ <code>Promise</code>
Recursively saves the tiles in the indexMapping at and below the input z, x,
 y

**Kind**: global variable  
**Returns**: <code>Promise</code> - when all the child tiles are saved.  
**Async**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| indexMapping | <code>LayerIndexMapping</code> |  |  |
| options | <code>Object</code> |  | @see ensureIndexes#options , with the following   special properties: |
| [options.ext] | <code>String</code> \| <code>undefined</code> | <code>&#x27;pbf&#x27;</code> | the file extension with which   to save each tile |
| [options.target] | <code>String</code> \| <code>undefined</code> | <code>&#x27;.&#x27;</code> | where to store the z/x/y tile   directory |
| options.maxZoom | <code>Number</code> |  | the maximum zoom to save |
| [z] | <code>Number</code> | <code>0</code> | the z-coordinate of the tile |
| [x] | <code>Number</code> | <code>0</code> | the x-coordinate of the tile |
| [y] | <code>Number</code> | <code>0</code> | the x-coordinate of the tile |

<a name="_toConsumableArray"></a>

## _toConsumableArray(z, x, y) ⇒ <code>Number</code>
Generates the id of a tile in a tileIndex. Copied from
https://github.com/mapbox/geojson-vt/blob/master/src/index.js#L195

**Kind**: global function  
**Returns**: <code>Number</code> - the hashed z/x/y id in a geojson-vt tiles object  

| Param | Type | Description |
| --- | --- | --- |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

