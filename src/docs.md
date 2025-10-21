<!-- prettier-ignore-start -->

Cadenza JS is a JavaScript library to use the [disy Cadenza](https://www.disy.net/en/products/disy-cadenza/) APIs conveniently without having to deal with technical details like parameter encoding or the `postMessage()` Web API.

* [Installation](#installation)
* [Usage Examples](#usage-examples)
* [The development sandbox](#the-development-sandbox)

## Installation

Cadenza JS is included in the Cadenza distribution in the corresponding version.

Alternatively you can install the most recent version for a particular Cadenza Release using npm:

```bash
npm install @disy/cadenza.js@~10.2.0 # For latest version for Cadenza 10.2 
```

The Cadenza main version is reflected in the corresponding major and minor version of Cadenza JS (e.g. 10.2.0 for Cadenza 10.2), while the last version segment is increased for both, bugfixes and functional changes.

### Cadenza 10.1 and earlier
For Cadenza 10.1 and earlier versions Cadenza JS used did use genuine semantic versioning. Please consult the Cadenza Documentation for the corresponding major and minor version of cadenza.js.

## Usage Examples

This section features usage examples for Cadenza JS. For detailed usage information, see the "API:" links.

### General Usage

<small>API: [cadenza()](./functions/cadenza.html)</small>

There are two ways to use Cadenza JS: As a module and globally.

#### As a module

Create an instance of the Cadenza client by calling `cadenza()` with the base URL of your Cadenza instance. Pass an iframe in the options if you want to show Cadenza in an iframe.

```html
<iframe id="cadenza-iframe"></iframe>
```

```javascript
import { cadenza } from '@disy/cadenza.js';

const cadenzaClient = cadenza({
  baseUrl: '<baseUrl>',
  iframe: 'cadenza-iframe',
});
```

_Tip:_ If you develop your application in TypeScript - Cadenza JS is typed using JSDoc and also comes with a `cadenza.d.ts` type definition file.

#### Globally

```html
<script type="module" src="./cadenza.js">
```

```javascript
const cadenzaClient = window.cadenza(...);
```

The `type="module"` has the effect that script execution is [deferred](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer). You might need to wait for the `DOMContentLoaded` event in order to use Cadenza JS.

```javascript
window.addEventListener('DOMContentLoaded', () => {
  const cadenzaClient = window.cadenza(...);
  ...
});
```

If for some reason you don't like the global `cadenza` field, you can remove it like so:

```javascript
const cadenza = window.cadenza.noConflict();
```

### Communication with parent Cadenza
If your application is opened from inside Cadenza (e.g. in a popup), you can send commands to parent Cadenza window.
To do that, create CadenzaClient with no arguments:
```javascript
const parentClient = window.cadenza();
```
_Warning:_ Not every operation can be done when dealing with parent Cadenza. For example `reload` and `expandNavigator` 
work, but `show`, `showMap` etc. require an iframe. Using these functions in this mode will result in errors.

### Show an Embedding Target in an Iframe

<small>API: [CadenzaClient#show](./classes/CadenzaClient.html#show)</small>

Show an embedding target in an iframe and ...

- Hide Cadenza's main header and footer and the workbook toolbar.
- Enable the simplified operation mode.
- Disable the designer.
- Set the filter variable "var1" to "foo".

```javascript
cadenzaClient.show('<embeddingTargetId>', {
  hideMainHeaderAndFooter: true,
  hideWorkbookToolBar: true,
  operationMode: 'simplified',
  disabledUiFeatures: ['workbook-design'],
  filter: {
    var1: 'foo'
  }
});
```

If a spatial filter is defined on the embedded target, it can be set with a dedicated variable name '$spatial':

```javascript
cadenzaClient.show('<embeddingTargetId>', {
  // ...
  filter: {
    '$spatial': {
      'spatialRelation': 'overlaps', // Also: 'notOverlaps', 'contains'
      'geometry': { // GeoJSON geometry; Restricted to type 'Polygon'
        'coordinates': [
          [
            [ 9.59, 52.70 ],
            [ 8.89, 51.72 ],
            [ 10.90, 51.72 ],
            [ 9.59, 52.70 ]
          ]
        ],
        'type': "Polygon"
      }
    }
  }
});
```

- If the embedding target cannot be resolved, a 404 page is shown to the user.
- Cadenza JS does not handle user authentication: If the user is not already logged in, the normal authentication flow of Cadenza will run. By default, the login page would be shown to the user.

#### Show the Generated PDF of a "JasperReports report" View Directly

Views of type "JasperReports report" can be shown in an iframe like any other view. Additionally, there is an option to show only the generated PDF without any Cadenza footers or headers. This is done by setting the "dataType" option to "pdf".

```javascript
cadenzaClient.show('<embeddingTargetId>', {
  dataType: 'pdf'
});
```

### Abort (Iframe) Loading

Cadenza JS uses the [AbortController Web API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for aborting requests. This is supported by most of the public methods.

```javascript
const abortController = new AbortController();
try {
  await cadenzaClient.show('<embeddingTargetId>', { signal: abortController.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Iframe loading was aborted');
  }
}

cancelButton.onclick = () => abortController.abort();
```

_Tip:_ You can use the same `AbortController` to abort multiple requests, e.g. when embedding Cadenza in multiple iframes.

### Set Filters in the Currently Shown Embedding Target

<small>API: [CadenzaClient#setFilter](./classes/CadenzaClient.html#setFilter)</small>

Set filter variables using a mapping of variable names to values.

```javascript
cadenzaClient.setFilter({ '<variableName>': 'value' });
```

Passing `null` as value removes the assigned filter value.

If a spatial filter is defined on the embedded target, it can be set with a dedicated variable name '$spatial':

```javascript
cadenzaClient.setFilter({
  '$spatial': {
    "spatialRelation": "overlaps", // Also: "notOverlaps", "contains"
    "geometry": { // GeoJSON geometry; Restricted to type "Polygon"
      "coordinates": [
        [
          [9.59, 52.70],
          [8.89, 51.72],
          [10.90, 51.72],
          [9.59, 52.70]
        ]
      ],
      "type": "Polygon"
    }
  }
});
```

### Show a Workbook Map View

<small>API: [CadenzaClient#showMap](./classes/CadenzaClient.html#showMap)</small>

Show the embedding target of a workbook map view in an iframe and ...

- Set the initial map extent.
- Show the given GeoJSON geometry on the map.

The coordinates of extent and geometry are in the map's SRS (`useMapSrs: true`).

```javascript
cadenzaClient.showMap('<embeddingTargetId>', {
  useMapSrs: true,
  extentStrategy: {
    type: 'static',
    extent: [ 
      -572_513.341856, 
      5_211_017.966314, 
      916_327.095083, 
      6_636_950.728974,
    ]
  },
  geometry: {
    type: 'Point',
    coordinates: [328_627.563458, 5_921_296.662223],
  },
});
```

#### Initialize the Map Extent by Setting the Location Finder

```javascript
cadenzaClient.showMap('<embeddingTargetId>', {
  extentStrategy: {
    type: 'locationFinder',
    query: 'Karlsruhe',
  }
});
```

### Set the Visibility of a Layer in the Currently Shown Workbook Map View

<small>API: [CadenzaClient#setLayerVisibility](./classes/CadenzaClient.html#setLayerVisibility)</small>

To set the visibility of a layer in the currently shown map, pass the layer path or print name and the desired visibility.

```javascript
cadenzaClient.setLayerVisibility('<layerPrintName>', false);
```

### Get the Image of the Currently Shown Workbook Map View

<small>API: [CadenzaClient#getData](./classes/CadenzaClient.html#getData)</small>

The method may support multiple data types in the future. Currently, only `"png"` is supported to get the image of a workbook map view.
You may pass the desired `width` and `height` in px and whether the resulting image should include the scale.

```javascript
const canvas = document.querySelector('canvas');
const data = await cadenzaClient.getData('png', { width: 1200, height: 800, withScale: true });
canvas.drawImage(await createImageBitmap(data), 0, 0);
```

### Edit an Existing Geometry

<small>API: [CadenzaClient#editGeometry](./classes/CadenzaClient.html#editGeometry), [CadenzaClient#on](./classes/CadenzaClient.html#on)</small>

Edit a GeoJSON geometry with a workbook map view in the background. The geometry coordinates are in the map's SRS (`useMapSrs: true`).

```javascript
const geometry = {
  type: 'Point',
  coordinates: [328_627.563458, 5_921_296.662223],
};
cadenzaClient.editGeometry('<embeddingTargetId>', geometry, {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:update', (event) => {
  console.log('Geometry was updated', event.detail);
});
cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail);
});
cadenzaClient.on('editGeometry:cancel', (event) => {
  console.log('Geometry editing was cancelled');
});
```

### Edit multiple Geometries

<small>API: [CadenzaClient#batchEditGeometry](./classes/CadenzaClient.html#batchEditGeometry), [CadenzaClient#on](./classes/CadenzaClient.html#on)</small>

Edit a collection of geometries with a workbook map view in the background. The geometry coordinates are in the map's SRS (`useMapSrs: true`).
The editor will create an additional layer where editable geometries are stored and selectable for editing. 
The layer's print name is 'Editor Layer' and can be used by other API actions. 
Additional geometries can also be created from within the editor once it has been initialized.
When finished, all geometries are collected and returned in a single collection.

_Note:_ The last geometry in the provided collection is initially selected for editing. At least one geometry must be provided.

```javascript
const feature1 = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [328_627.563458, 5_921_296.662223],
    }
  };

const feature2 = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [916_327.095083, 6_636_950.728974],
    }
  };

const featureCollection = {
  type: 'FeatureCollection',
  features: [feature1 , feature2]
}

cadenzaClient.batchEditGeometry('<embeddingTargetId>', featureCollection, {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:update', (event) => {
  console.log('Geometry was updated', event.detail);
});
cadenzaClient.on('editGeometry:create', (event) => {
  console.log('At least one geometry feature was created', event.detail);
});
cadenzaClient.on('editGeometry:edit', (event) => {
  console.log('Geometry feature was edited', event.detail);
});
cadenzaClient.on('editGeometry:delete', (event) => {
  const deletedFeatures = event.details.featureIds;
  ...
});
cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail);
});
cadenzaClient.on('editGeometry:cancel', (event) => {
  console.log('Geometry editing was cancelled');
});
```

### Unsubscribe From an Event

The `on()` method returns an unsubscribe function.

```javascript
const unsubscribe = cadenzaClient.on('editGeometry:ok', (event) => ...);
...
unsubscribe();
```

### Create a New Geometry

<small>API: [CadenzaClient#createGeometry](./classes/CadenzaClient.html#createGeometry)</small>

Create a GeoJSON point geometry with a workbook map view in the background. The geometry coordinates are in the map's SRS (`useMapSrs: true`).

```javascript
cadenzaClient.createGeometry('<embeddingTargetId>', 'Point', {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail);
});
```

_Note:_ Under the hood, creating a geometry is similar to editing a geometry.
That's why the events use the `editGeometry` prefix.

### Create multiple Geometries

<small>API: [CadenzaClient#batchCreateGeometry](./classes/CadenzaClient.html#batchCreateGeometry), [CadenzaClient#on](./classes/CadenzaClient.html#on)</small>

Create multiple geometries with a workbook map view in the background. The geometry coordinates are in the map's SRS (`useMapSrs: true`).
The editor will create an additional layer where created geometries are stored and selectable for editing. 
The layer's print name is 'Editor Layer' and can be used by other API actions.
When finished, all geometries are collected and returned in a single collection.

```javascript

cadenzaClient.batchCreateGeometry('<embeddingTargetId>', 'Point', {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:update', (event) => {
  console.log('Geometry was updated', event.detail);
});
cadenzaClient.on('editGeometry:create', (event) => {
  console.log('At least one geometry feature was created', event.detail);
});
cadenzaClient.on('editGeometry:edit', (event) => {
  console.log('Geometry feature was edited', event.detail);
});
cadenzaClient.on('editGeometry:delete', (event) => {
  const deletedFeatures = event.details.featureIds;
  ...
});
cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail);
});
cadenzaClient.on('editGeometry:cancel', (event) => {
  console.log('Geometry editing was cancelled');
});
```

#### Additional Background Layers

Create a GeoJSON polygon geometry with a workbook map view and some additional background layers.

IMPORTANT: The Cadenza referenced with `cadenzaClient` must be configured to support the import of GeoJSON, and the (system) privileges of the corresponding user must also be set in such a way that the import of GeoJSON is possible.

```javascript
cadenzaClient.createGeometry('<embeddingTargetId>', 'Polygon', {
  additionalLayers: [
    { type: 'geojson', name: 'Example', content: <FeatureCollection> },
    ...
  ]
});
```

### Select Objects in a Workbook Map View

<small>API: [CadenzaClient#selectObjects](./classes/CadenzaClient.html#selectObjects)</small>

Ask the user to select objects in a workbook map view. In the example the selection is restricted to specific layers. For layers in groups, pass the layer path.

```javascript
cadenzaClient.selectObjects('<embeddingTargetId>', {
  layers: [
    [ '<layerGroupPrintName>', '<layerPrintName>' ],
    [ '<layerPrintName>' ]
  ]
});

cadenzaClient.on('selectObjects:ok', (event) => {
  console.log('Object selection was completed', event.detail.selection);
});
```

#### _Programmatically_ Set the Selection in the Currently Shown Workbook Map View

<small>API: [CadenzaClient#setSelection](./classes/CadenzaClient.html#setSelection)</small>

Set the selection in the currently shown workbook map view using a list of object IDs to select. An empty list clears the selection.

```javascript
cadenzaClient.setSelection(
  layer: '<layerPrintName>',
  values: [ 'objectId', ... ]
);
```

You can also add to or remove from the current selection:
* <small>API: [CadenzaClient#addSelection](./classes/CadenzaClient.html#addSelection)</small>
* <small>API: [CadenzaClient#removeSelection](./classes/CadenzaClient.html#removeSelection)</small>

### Highlight an Item in the Navigator

<small>API: [CadenzaClient#show](./classes/CadenzaClient.html#show)</small>

Show an embedding target in an iframe and highlight an item in the navigator. Additionally, expand the navigator tree.

```javascript
cadenzaClient.show('<embeddingTargetId>', {expandNavigator: true, highlightGlobalId: 'ROOT.MyFolder'});
```

#### Highlight an Item in the Navigator on the Welcome Page

<small>API: [CadenzaClient#show](./classes/CadenzaClient.html#show)</small>

Show Cadenza's welcome page in an iframe and highlight an item in the navigator.

```javascript
cadenzaClient.show({page: 'welcome'}, {highlightGlobalId: 'ROOT.MyFolder'});
```

#### Expand the Navigator

<small>API: [CadenzaClient#expandNavigator](./classes/CadenzaClient.html#expandNavigator)</small>

Expand the navigator.

```javascript
cadenzaClient.expandNavigator();
```

### Fetch Data From a Workbook View

<small>API: [CadenzaClient#fetchData](./classes/CadenzaClient.html#fetchData)</small>

Fetch data from a workbook view in CSV format.

```javascript
const response = await cadenzaClient.fetchData('<embeddingTargetId>', 'csv');

const text = await response.text();
...
```

#### Control the Contents of the Fetched Table Data

Fetch data from a workbook view in JSON format and include only the data values and the aggregation totals. (Do not include the column names.)

```javascript
const response = await cadenzaClient.fetchData('<embeddingTargetId>', 'json', {
  parts: ['values', 'totals']
});

const tableData = await response.json();
...
```

### Fetch the Object Info from a Workbook Map View

<small>API: [CadenzaClient#fetchObjectInfo(./classes/CadenzaClient.html#fetchObjectInfo)</small>

Fetch the object info from a workbook map view in JSON format. The result contains all information, that is shown in the object info within cadenza.

```javascript
const objectInfo = await cadenzaClient.fetchObjectInfo('embeddingTargetId', 'layerPrintName', [['objectId']], {
  useMapSrs: false,
  fullGeometries: true
});
```

### Fetch the area intersection from a Workbook Map View Layer

<small>API: [CadenzaClient#fetchObjectInfo(./classes/CadenzaClient.html#fetchAreaIntersections)</small>

Fetch the intersection area from a workbook map view layer in JSON format for a given area. The result contains all intersecting objects of the layer, their object ID, if defined the object name and a geometry representing the intersection area, with area size and area perimeter.

If the geometry intersection fails because a geometry is invalid, a problem detail object is returned. In all other error cases, an exception is thrown.

```javascript
const geometry = {
  type: 'Point',
  coordinates: [328_627.563458, 5_921_296.662223],
};
const bufferSize = {
  value: 100,
  lengthUnit: 'm'
}

const areaIntersectionsResult = await cadenzaClient.fetchAreaIntersections('embeddingTargetId', 'layerPrintName', geometry, {
  useMapSrs: true,
  bufferSize: bufferSize,
  useAutoCorrection: true,
  includeGeometryValidationReport: true
});
```
Response with activated autocorrection and  geometry validation report
```json
{
  "results": {
    "features": [
      {
        "objectId": [ 333 ],
        "geometry": {
          "type": "Polygon",
          "coordinates": [<coordinates>]
        },
        "area": 5209.274047788233,
        "type": "Feature"
      }
    ],
    "type": "FeatureCollection"
  },
  "errors": {
    "features": [
      {
        "objectId": [ 333 ],
        "geometry": {
          "type": "Point",
          "coordinates": [ 457172.35, 5427744.68]
        },
        "properties": {
          "category": "Ring Self-intersection",
          "message": "Ring Self-intersection at or near point (457172.35, 5427744.68, NaN)"
        },
        "type": "Feature"
      }
    ],
    "type": "FeatureCollection"
  }
}
```

### Download Data From a Workbook View

<small>API: [CadenzaClient#downloadData](./classes/CadenzaClient.html#downloadData)</small>

Download data from a workbook view in Excel format. This triggers the browser's download dialog.

```javascript
const button = document.createElement('button');
button.textContent = 'Download Excel';
button.onclick = () => cadenzaClient.downloadData('<embeddingTargetId>', 'excel');
```

### Reload the Views of a Worksheet

<small>API: [CadenzaClient#reload](./classes/CadenzaClient.html#reload)</small>

To reload a worksheet:
```javascript
cadenzaClient.reload();
```

To invalidate caches and reload:
```javascript
cadenzaClient.reload({ invalidateCaches: true });
```

### Close the Cadenza Dialog or Window That Embeds the Custom Application

<small>API: [CadenzaClient#closeMe](./classes/CadenzaClient.html#closeMe)</small>

Sends a message to parent Cadenza window to close the window containing this application.
```javascript
cadenzaClient.closeMe();
```

#### Listen for Cadenza Closing the Custom Application

Cadenza does not send an event when the dialog or window is closed that embeds the custom application. Depending on your use case you might listen to these browser events instead:
* The [Window: `unload` event](https://developer.mozilla.org/docs/Web/API/Window/unload_event) is dispatched when the window/dialog is closed.
* The [Document: `visibilitychange` event](https://developer.mozilla.org/docs/Web/API/Document/visibilitychange_event) is dispatched when the window/dialog is closed _or hidden_ (for example when the user switches to another browser tab).

_Note:_ If you need to send a request to your server when the window/dialog is closed, you should use the [Navigator: `sendBeacon()` method](https://developer.mozilla.org/docs/Web/API/Navigator/sendBeacon). It's limited to POST requests, but in contrast to the "normal" XHR or `fetch()` APIs, it works reliably when the dialog/window is closed.

## The Development Sandbox

The development sandbox is a simple custom application (in fact a single `.html` file) for playing with Cadenza JS.

To run it ...

* You need a Cadenza installation running on http://localhost:8080/cadenza. (See [Customize the Cadenza URL](#customize-the-cadenza-url) below)
* In `node_modules/@disy/cadenza.js` run `npm run sandbox` to start the sandbox.

The command starts a proxy server that serves the `sandbox.html` and `cadenza.js` files and proxies all other requests to the Cadenza server. Since that way the sandbox and Cadenza run on the same origin, embedding and `postMessage` communication just work.

Alternatively ...

* Set the system variable `"net.disy.cadenza.sandbox"` in Cadenza to enable the sandbox.
* Now, `sandbox.html` is served on http://localhost:8080/cadenza/sandbox (replace with custom Cadenza url `/sandbox` as needed).

`cadenza.js` is automatically served when Cadenza starts.

### The Sandbox UI

`npm run sandbox` also opens the sandbox in a new browser window. Select the Cadenza JS method you want to play with in the select box at the top. For each method there are controls to define the parameters. Hit "Go!" to call the method.

The sandbox uses Cadenza JS with the "debug" option enabled, so you can see what is going on internally in the browser's devtools console. In the "Network" tab of the devtools you can see the requests to the Cadenza server.

### Customize the Cadenza URL

By default, the sandbox expects Cadenza to run on http://localhost:8080/cadenza. There are two ways to customize the Cadenza URL:

* Pass an argument:
  ```bash
  npm run sandbox -- --cadenza-url http://localhost:8000/my-cadenza
  ```
* Set an environment variable:
  ```bash
  export CADENZA_URL=http://localhost:8000/my-cadenza
  npm run sandbox
  ```

## JSON Representation of Cadenza Object Data

[JSON](https://www.json.org/) is a simple data-interchange format, which is also used in the Cadenza API. It does not support all the attribute types of Cadenza objects, that's why there are some rules for representing Cadenza object data in JSON.


| Cadenza Attribute Type              | JSON Type | JSON Example Value       | Notes |
|-------------------------------------|-----------|--------------------------|-------|
| Text (String)                       | string    | `"Text"`                 | |
| Number (Integer)                    | number    | `1`                      | |
| Number (Long)                       | string    | `"1"`                    | The long value range exceeds the range of the JSON number type. So it's represented as a string. |
| Floating point number (Double)      | number    | `1.23`                   |
| Floating point number (Big decimal) | string    | `"1.23"`                 | The big decimal value range exceeds the range of the JSON number type. So it's represented as a string. |
| Date                                | string    | `"1999-12-31T23:00:00Z"` | A date is represented as an [ISO string in universal time](https://en.wikipedia.org/wiki/ISO_8601#Coordinated_Universal_Time_(UTC)) (UTC). |
| Duration                            | number    | `1`                      | A duration is represented by its numeric value. |
| Geometry                            | object    | <pre lang="json">{<br>  "type": "Point"<br>  "coordinates": [125.6, 10.1]<br>}</pre> | A geometry is represented as a [GeoJSON](https://geojson.org/) object.<br>_Note:_ By default, coordinates in GeoJSON use the WGS84 projection. |
| IP address                          | string    | `"127.0.0.1"`            | |
| URL                                 | string    | `"http://example.com"`   | |
| LOB                                 | string    |                          | |

<!-- prettier-ignore-end -->
