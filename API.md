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
<dt><a href="#ensureIndexes">ensureIndexes(layerIndexMapping, [options])</a> ⇒ <code><a href="#LayerIndexMapping">LayerIndexMapping</a></code></dt>
<dd><p>Ensures any geojson layers input are turned into
<a href="#TileIndex">TileIndexes</a></p>
</dd>
<dt><a href="#getTiles">getTiles(layerIndexMapping, z, x, y)</a> ⇒ <code><a href="#LayerTileMapping">LayerTileMapping</a></code></dt>
<dd><p>Gets a tile at given coordinates from each input tileIndex</p>
</dd>
<dt><a href="#getBuff">getBuff(layerIndexMapping, z, x, y)</a> ⇒ <code>protobuf</code> | <code>undefined</code></dt>
<dd><p>Returns the non-empty pbf tile at coordinates z, x, y</p>
</dd>
<dt><a href="#saveBuff">saveBuff(buff, z, x, y, options)</a> ⇒ <code>Promise</code></dt>
<dd><p>saves a protobuf in slippy tile format</p>
</dd>
<dt><a href="#storeMvt">storeMvt(layerIndexMapping, options)</a> ⇒ <code>Promise</code></dt>
<dd><p>Turns a mapping of layer names to layer tile indexes into a directory
of /x/y/z/tile.mvt</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#LayerIndexMapping">LayerIndexMapping</a></dt>
<dd><p>A mapping of layer names to <a href="#TileIndex">TileIndexes</a>.</p>
</dd>
<dt><a href="#LayerTileMapping">LayerTileMapping</a></dt>
<dd><p>A mapping of layer names to @see Tiles at a given z, x, y.</p>
</dd>
<dt><a href="#MVT">MVT</a></dt>
<dd></dd>
</dl>

<a name="TileIndex"></a>

## TileIndex
A datastructure indexing geospatial objects that outputs tiles via a
getTile method.  @see [https://github.com/mapbox/geojson-vt#usage](https://github.com/mapbox/geojson-vt#usage)

**Kind**: global interface  
<a name="TileIndex.getTile"></a>

### TileIndex.getTile(z, x, y) ⇒ <code>Tile</code>
Gets a tile at coordinates z, x, y

**Kind**: static method of [<code>TileIndex</code>](#TileIndex)  
**Returns**: <code>Tile</code> - a geojson-vt-compatible JSON tile object  

| Param | Type | Description |
| --- | --- | --- |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

<a name="recur"></a>

## recur ⇒ <code>Promise</code>
Recursively saves the tiles in the indexMapping at and below the input z, x,
 y

**Kind**: global variable  
**Returns**: <code>Promise</code> - when all the child tiles are saved.  
**Async**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| indexMapping | [<code>LayerIndexMapping</code>](#LayerIndexMapping) |  |  |
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

<a name="ensureIndexes"></a>

## ensureIndexes(layerIndexMapping, [options]) ⇒ [<code>LayerIndexMapping</code>](#LayerIndexMapping)
Ensures any geojson layers input are turned into
[TileIndexes](#TileIndex)

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| layerIndexMapping | <code>Object</code> |  | where layers may be either geojson or  [TileIndexes](#TileIndex) |
| [options] | <code>Object</code> | <code>{}</code> | Options for geojson-vt to parse a geojson   dataset. @see https://github.com/mapbox/geojson-vt#options |

<a name="getTiles"></a>

## getTiles(layerIndexMapping, z, x, y) ⇒ [<code>LayerTileMapping</code>](#LayerTileMapping)
Gets a tile at given coordinates from each input tileIndex

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | <code>Object</code> | {[layerName]: tileIndex} |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

<a name="getBuff"></a>

## getBuff(layerIndexMapping, z, x, y) ⇒ <code>protobuf</code> \| <code>undefined</code>
Returns the non-empty pbf tile at coordinates z, x, y

**Kind**: global function  
**Returns**: <code>protobuf</code> \| <code>undefined</code> - the non-empty mvt (now a protobuf) or undefined
if the tile(s) at these coordinates are empty  

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | [<code>LayerIndexMapping</code>](#LayerIndexMapping) | An object mapping layer names   to tile indexes |
| z | <code>Nubmer</code> | the z-index of the tile |
| x | <code>Number</code> | the x-index of the tile |
| y | <code>Number</code> | the y-index of the tile |

<a name="saveBuff"></a>

## saveBuff(buff, z, x, y, options) ⇒ <code>Promise</code>
saves a protobuf in slippy tile format

**Kind**: global function  
**Returns**: <code>Promise</code> - resolves true when done.  
**Async**:   

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| buff | [<code>MVT</code>](#MVT) |  | a protobuf-encoded .mvt tile |
| z | <code>Nubmer</code> |  | the z-index of the tile |
| x | <code>Number</code> |  | the x-index of the tile |
| y | <code>Number</code> |  | the y-index of the tile |
| options | <code>Object</code> |  | ... |
| [options.target] | <code>String</code> | <code>&#x27;.&#x27;</code> | the path to the z/x/y tile directory |
| [options.ext] | <code>String</code> | <code>&#x27;pbf&#x27;</code> | the file extension to use on each tile |

<a name="storeMvt"></a>

## storeMvt(layerIndexMapping, options) ⇒ <code>Promise</code>
Turns a mapping of layer names to layer tile indexes into a directory
of /x/y/z/tile.mvt

**Kind**: global function  
**Returns**: <code>Promise</code> - when all recursion has completed.  
**Async**:   
**Export**:   

| Param | Type | Description |
| --- | --- | --- |
| layerIndexMapping | [<code>LayerIndexMapping</code>](#LayerIndexMapping) | {[layerName]: tileIndex} |
| options | <code>Object</code> | @see ensureIndexes#options |

<a name="LayerIndexMapping"></a>

## LayerIndexMapping
A mapping of layer names to [TileIndexes](#TileIndex).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| *layerName | [<code>TileIndex</code>](#TileIndex) | a tile index that represents a layer in the resulting tileset |

<a name="LayerTileMapping"></a>

## LayerTileMapping
A mapping of layer names to @see Tiles at a given z, x, y.

**Kind**: global typedef  
**Properties**

| Type |
| --- |
| <code>Tile</code> | 

<a name="MVT"></a>

## MVT
**Kind**: global typedef  
