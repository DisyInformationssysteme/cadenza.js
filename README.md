Cadenza JS is a JavaScript library to use the [disy Cadenza](https://www.disy.net/en/products/disy-cadenza/) APIs conveniently without having to deal with technical details like parameter encoding or the `postMessage()` Web API.

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
import { cadenza } from './cadenza.js';

const cadenzaClient = cadenza('{baseUrl}', {
  iframe: 'cadenza-iframe',
});
```

_Tip:_ If you develop your application in TypeScript - Cadenza JS is typed using JSDoc and also comes with a `cadenza.d.ts` type definition file.

#### Globally

```html
<script type="module" src="cadenza.js">
```

```javascript
const cadenzaClient = window.cadenza('{baseUrl}', ...);
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

### Show an Embedding Target in an Iframe

<small>API: [CadenzaClient#show](./classes/CadenzaClient.html#show)</small>

Show an embedding target in an iframe and hide Cadenza's main header and footer as well as the workbook toolbar:

```javascript
cadenzaClient.show('{embeddingTargetId}', {
  hideMainHeaderAndFooter: true,
  hideWorkbookToolBar: true,
});
```

- If the embedding target cannot be resolved, a 404 page is shown to the user.
- Cadenza JS does not handle user authentication: If the user is not already logged in, the normal authentication flow of Cadenza will run. By default, the login page would be shown to the user.

#### Show the Generated PDF of a "JasperReports report" View Directly

Views of type "JasperReports report" can be shown in an iframe like any other view. Additionally, there is an option to show only the generated PDF without any Cadenza footers or headers. This is done by setting the "mediaType" option to "application/pdf".

```javascript
cadenzaClient.show('{embeddingTargetId}', {
  mediaType: 'application/pdf'
});
```

### Abort (Iframe) Loading

Cadenza JS uses the [AbortController Web API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) for aborting requests. This is supported by most of the public methods.

```javascript
const abortController = new AbortController();
try {
  await cadenzaClient.show('{embeddingTargetId}', { signal: abortController.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Iframe loading was aborted');
  }
}

cancelButton.onclick = () => abortController.abort();
```

_Tip:_ You can use the same `AbortController` to abort multiple requests, e.g. when embedding Cadenza in multiple iframes.

### Show a Workbook Map View

<small>API: [CadenzaClient#showMap](./classes/CadenzaClient.html#showMap)</small>

Show the embedding target of a workbook map view in an iframe and ...

- Set the initial map extent.
- Show the given GeoJSON geometry on the map.

The coordinates of extent and geometry are in the map's SRS.

```javascript
cadenzaClient.showMap('{embeddingTargetId}', {
  useMapSrs: true,
  mapExtent: [
    -572_513.341856, 5_211_017.966314, 916_327.095083, 6_636_950.728974,
  ],
  geometry: {
    type: 'Point',
    coordinates: [328_627.563458, 5_921_296.662223],
  },
});
```

#### Initialize the Map Extent by Setting the Location Finder

```javascript
cadenzaClient.showMap('{embeddingTargetId}', {
  locationFinder: 'Karlsruhe',
});
```

### Edit an Existing Geometry

<small>API: [CadenzaClient#editGeometry](./classes/CadenzaClient.html#editGeometry), [CadenzaClient#on](./classes/CadenzaClient.html#on)</small>

Edit a GeoJSON geometry with a workbook map view in the background. The geometry coordinates are in the map's SRS.

```javascript
const geometry = {
  type: 'Point',
  coordinates: [328_627.563458, 5_921_296.662223],
};
cadenzaClient.editGeometry('{embeddingTargetId}', geometry, {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:update', (event) => {
  console.log('Geometry was updated', event.detail.geometry);
});
cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail.geometry);
});
cadenzaClient.on('editGeometry:cancel', (event) => {
  console.log('Geometry editing was cancelled');
});
```

### Subscribe to an Event With Types

If you develop your application in TypeScript, you need to define the type of the `event.detail` in order to access its properties:

```typescript
cadenzaClient.on(
  'editGeometry:ok',
  (event: CadenzaEvent<{ geometry: Geometry }>) => {
    console.log('Geometry editing was completed', event.detail.geometry);
  },
);
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

Edit a GeoJSON point geometry with a workbook map view in the background. The geometry coordinates are in the map's SRS.

```javascript
cadenzaClient.createGeometry('{embeddingTargetId}', 'Point', {
  useMapSrs: true,
});

cadenzaClient.on('editGeometry:ok', (event) => {
  console.log('Geometry editing was completed', event.detail.geometry);
});
```

_Note:_ Under the hood, creating a geometry is similar to editing a geometry.
That's why the events use the `editGeometry` prefix.

### Fetch Data From a Workbook View

<small>API: [CadenzaClient#fetchData](./classes/CadenzaClient.html#fetchData)</small>

Fetch data from a workbook view in CSV format.

```javascript
const response = await cadenzaClient.fetchData('{embeddingTargetId}', 'text/csv');

const text = await response.text();
...
```

### Download Data From a Workbook View

<small>API: [CadenzaClient#downloadData](./classes/CadenzaClient.html#downloadData)</small>

Download data from a workbook view in Excel format. This triggers the browser's download dialog.

```javascript
const button = document.createElement('button');
button.textContent = 'Download Excel';

button.onclick = (event) => {
  cadenzaClient.downloadData('{embeddingTargetId}',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
```
