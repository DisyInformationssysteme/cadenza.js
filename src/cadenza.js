/**
 * @typedef CadenzaClientOptions
 * @property {string} [baseUrl] - The base URL of the Cadenza server
 * @property {HTMLIFrameElement | string} [options.iframe] - An iframe for embedding Cadenza or the iframe's ID.
 *   The iframe is required only for methods that embed Cadenza in an iframe, so e.g. not for {@link CadenzaClient#fetchData}.
 *   If you want to embed Cadenza in multiple iframes, you need to create an instance of the `CadenzaClient` per iframe.
 * @property {ExternalLinkKey} [options.webApplication] - An external link that Cadenza uses to resolve the
 *   [target origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin) when posting events.
 *   This is required if Cadenza and your application are not running on the same origin.
 *   Please ensure that the user has view privilege for that link!
 * @property {boolean} [options.debug] - Whether to enable debug logging
 */

/**
 * Creates an instance of the Cadenza JS client.
 *
 * @overload
 * @param {CadenzaClientOptions} [options] - Options
 * @return {CadenzaClient}
 * @throws For invalid arguments
 */
/**
 * Creates an instance of the Cadenza JS client.
 *
 * @deprecated This overload is deprecated since <time>2024-05-08</time> and will eventually be removed.
 *   Please use the other overload.
 * @overload
 * @param {string} baseUrl - The base URL of the Cadenza server
 * @param {Exclude<CadenzaClientOptions, 'baseUrl'>} [options] - Options
 * @return {CadenzaClient}
 * @throws For invalid arguments
 */
/**
 * @param {string | CadenzaClientOptions} [baseUrlOrOptions]
 * @param {CadenzaClientOptions} [options]
 */
export function cadenza(baseUrlOrOptions, options) {
  options =
    typeof baseUrlOrOptions === 'string'
      ? { baseUrl: baseUrlOrOptions, ...options }
      : baseUrlOrOptions;
  return new CadenzaClient(options);
}

/* @ts-ignore */
const previousGlobalCadenza = globalThis.cadenza;
globalThis.cadenza = Object.assign(
  (/** @type Parameters<cadenza> */ ...args) => cadenza(...args),
  {
    noConflict() {
      globalThis.cadenza = previousGlobalCadenza;
      return cadenza;
    },
  },
);

/**
 * @template {string} T
 * @typedef {string & {__type: T}} OpaqueString - A specific `string` type that is not assignable from another string
 *
 * The idea is to have a specific type e.g. for the {@link EmbeddingTargetId} instead of a plain `string`.
 * You don't need to _actually_ add that `__type` property. In TS code, just use a
 * [type assertion](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
 * (e.g. `cadenzaClient.show('<embeddingTargetId>' as EmbeddingTargetId)`).
 */

/**
 * @typedef {OpaqueString<'EmbeddingTargetId'>} EmbeddingTargetId - The ID of a Cadenza embedding target
 *
 * Embedding targets are called 🇩🇪 "Einbettbarer Inhalt" / 🇺🇸 "Embeddable content" throughout the Cadenza UI and help.
 * They're managed within the respective workbook:
 *
 * - 🇩🇪 "Mehr" > "Arbeitsmappe verwalten" > "Einbettung"
 * - 🇺🇸 "More" > "Manage workbook" > "Embedding"
 *
 * The name of an embedding target (as entered in the UI) is its ID.
 */

/** @typedef {OpaqueString<'GlobalId'>} GlobalId - The ID of a navigator item */

/**
 * @typedef ExternalLinkKey - A tuple qualifying a Cadenza external link
 *
 * You get the `repositoryName` and `externalLinkId` from the URL of the external link's page in the Cadenza management center:
 * ```
 * <baseUrl>/admin/repositories/<repositoryName>/external-links/<externalLinkId>?...
 * ```
 *
 * @property {string} repositoryName - The name of the link's repository
 * @property {string} externalLinkId - The ID of the external link
 */
/**
 * @typedef {string[]} WorkbookLayerPath - Identifies a layer within a workbook map view
 *   using the print names of the layer and - if the layer is grouped - its ancestors
 */

/**
 * @typedef PageSource - A well-known Cadenza page
 * @property {'welcome'} page - The name of the page (Only `"welcome"` is currently supported.)
 */

/** @typedef {'normal'|'simplified'} OperationMode - The mode in which a workbook should be operated */
/**
 * @typedef {'workbook-design'|'workbook-view-management'} UiFeature - The name of a Cadenza UI feature
 *
 * _Note:_ Supported features are:
 * * `"workbook-design"` - The workbook designer
 * * `"workbook-view-management"` - Add/Edit/Remove workbook views (Is included in 'workbook-design'.)
 * */

/**
 * @typedef Distance
 * @property {number} value
 * @property {LengthUnit} lengthUnit
 */
/**
 * @typedef {'m'|'km'} LengthUnit
 */

/**
 * @typedef Geometry - A [GeoJSON](https://geojson.org/) geometry object
 * @property {GeometryType} type - The type of the geometry
 */
/**
 * @typedef {'Point'|'MultiPoint'|'LineString'|'MultiLineString'|'Polygon'|'MultiPolygon'} GeometryType - A GeoJSON geometry type
 *
 * _Note:_ The GeoJSON geometry type "GeometryCollection" is currently not supported.
 */
/** @typedef {[number,number,number,number]} Extent - An array of numbers representing an extent: [minx, miny, maxx, maxy] */

/**
 * @typedef {GeometryExtentStrategy} ExtentStrategy - Options for defining the initial extent
 */

/**
 * @typedef GeometryExtentStrategy - The given {@link Geometry} defines the initial map extent.
 * @property {'geometry'} type - The extent strategy type
 * @property {Geometry} [geometry] - This geometry takes precedence over another geometry that might be given in an API call.
 */

/**
 * @typedef {'csv' | 'excel' | 'json' | 'pdf' | 'png'} DataType - A data type
 *
 * See [JSON Representation of Cadenza Object Data](../index.html#md:json-representation-of-cadenza-object-data) for JSON data.
 */
/** @typedef {'columns' | 'values' | 'totals'} TablePart - A part of a table to export */
/**
 * @typedef {Record<string, string | string[] | number | Date | null>} FilterVariables - Filter variable names and values
 *
 * Variables of type String, Integer, Long, Double and Date can be set.
 *
 * _Note:_ Since numbers in JavaScript are Double values ([more info on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_encoding)),
 * for Long variables, the API is currently limited to the Double value range.
 */
/**
 * @typedef Feature - A adapted [GeoJSON](https://geojson.org/) feature object.
 * @property {any[]} objectId - The id of the feature
 * @property {Geometry} geometry - The geometry
 * @property {Record<string, string>} properties - The formated properties
 * @property {number} [area] - The area of a `Polygon` feature
 * @property {number} [length] - The area of a `LineString` feature
 */
/**
 * @typedef FeatureCollection - A adapted [GeoJSON](https://geojson.org/) feature collection object
 * @property {Feature[]} features - The features within this collection
 */
/** @typedef {'error'|'warning'|'info'|'success'} CustomValidityType - The type of custom validity used for disclose on visual presentation and form submission behavior */

let hasCadenzaSession = false;

/** @type {Promise<void> | undefined} */
let firstEmbeddingTargetShown;

/**
 * _Notes:_
 * * Most public methods are tagged with one of these modifiers:
 *   * `Embed`: The method embeds Cadenza in the given iframe.
 *   * `Post Message`: The method communicates with an embedded or parent/opener Cadenza via postMessage.
 *   * `Post Message Parent`: The method communicates with a parent/opener Cadenza via postMessage.
 *   * `Server`: The method communicates with the Cadenza server via HTTP.
 * * Most public methods can be aborted using an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
 *   When aborted, the result Promise is rejected with an {@link AbortError}.
 * * If there's another error, the result Promise is rejected with a {@link CadenzaError}.
 * * For methods that support the `hideMainHeaderAndFooter` and `hideWorkbookToolBar` parameters - the parameters cannot override the configuration of an embedding target.
 * * For methods that support the `locationFinder` and `mapExtent` parameters - when both are given, the `mapExtent` takes precedence.
 */
// Must be exported to be included in the docs.
export class CadenzaClient {
  /** @readonly */
  #baseUrl;

  /** @readonly */
  #origin;

  /** @readonly */
  #iframe;

  /** @readonly @type {ExternalLinkKey | undefined} */
  #webApplication;

  /** @type {HTMLIFrameElement | undefined} */
  #iframeElement;

  /** @readonly */
  #debug;

  /** @type {[ CadenzaEventType | string, (event: CadenzaEvent<never>) => void ][]} */
  #subscriptions = [];

  /**
   *
   * @hidden
   * @param {CadenzaClientOptions} [__namedParameters]
   */
  constructor({ baseUrl, debug = false, iframe, webApplication } = {}) {
    if (webApplication) {
      assert(
        validExternalLinkKey(webApplication),
        `Invalid webApplication parameter: ${webApplication}`,
      );
    }

    if (baseUrl != null) {
      assert(validUrl(baseUrl), `Invalid baseUrl: ${baseUrl}`);
      // Remove trailing /
      if (baseUrl.at(-1) === '/') {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
      }
      this.#baseUrl = baseUrl;
      this.#origin = new URL(baseUrl).origin;
      this.#iframe = iframe;
      this.#log('Create Cadenza client', baseUrl, iframe);
    } else {
      this.#origin = '*';
      this.#log('Create Cadenza client for parent Cadenza');
    }
    this.#debug = debug;
    this.#webApplication = webApplication;
  }

  /** The base URL of the Cadenza server this client is requesting */
  get baseUrl() {
    return this.#baseUrl;
  }

  /** The iframe this client is using for embedding Cadenza. */
  get iframe() {
    const iframe = this.#iframe;
    if (!this.#iframeElement && iframe) {
      this.#iframeElement =
        typeof iframe === 'string'
          ? /** @type {HTMLIFrameElement} */ (
              document.getElementById(iframe) ?? undefined
            )
          : iframe;
    }
    return this.#iframeElement;
  }

  get #targetWindow() {
    const targetWindow = this.#iframe
      ? this.iframe?.contentWindow
      : // If a window does not have a parent, its parent property is a reference to itself.
        window.opener ?? (window.parent !== window ? window.parent : null);
    return /** @type {WindowProxy | null} */ targetWindow;
  }

  get #requiredIframe() {
    const iframe = /** @type {HTMLIFrameElement} */ (this.iframe);
    assert(
      iframe instanceof HTMLIFrameElement,
      'Required iframe is not present.',
    );
    const { width, height } = iframe.getBoundingClientRect();
    assert(width > 0 && height > 0, 'Iframe must be visible.');
    return iframe;
  }

  /**
   * Show a page, workbook, worksheet or workbook view in an iframe.
   *
   * @param {PageSource | EmbeddingTargetId} source - The source to show
   * @param {object} [__namedParameters]
   * @param {DataType} [__namedParameters.dataType] - Set to 'pdf' for views of type "JasperReports report"
   *     to show the report PDF directly, without any Cadenza headers or footers.
   * @param {UiFeature[]} [__namedParameters.disabledUiFeatures] - Cadenza UI features to disable
   * @param {boolean} [__namedParameters.expandNavigator] - Indicates if the navigator should be expanded.
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {boolean} [__namedParameters.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer
   * @param {boolean} [__namedParameters.hideWorkbookToolBar] - Whether to hide the workbook toolbar
   * @param {GlobalId} [__namedParameters.highlightGlobalId] - The ID of an item to highlight / expand in the navigator
   * @param {String} [__namedParameters.labelSet] - The name of a label set defined in the `basicweb-config.xml` (only supported for the welcome page)
   * @param {OperationMode} [__namedParameters.operationMode] - The mode in which a workbook should be operated
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaDrillThroughEvent}
   * - {@link CadenzaActionEvent}
   * @embed
   */
  show(
    source,
    {
      dataType,
      disabledUiFeatures,
      expandNavigator,
      filter,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      highlightGlobalId,
      labelSet,
      operationMode,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#show', ...arguments);
    if (dataType) {
      assertSupportedDataType(dataType, ['pdf']);
    }
    if (labelSet) {
      assert(
        typeof source !== 'string' &&
          'page' in source &&
          source.page === 'welcome',
        'labelSet is only supported on the welcome page',
      );
    }
    const params = createParams({
      disabledUiFeatures,
      expandNavigator,
      filter,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      highlightGlobalId,
      labelSet,
      dataType,
      operationMode,
    });
    return this.#show(resolvePath(source), params, signal);
  }

  /**
   * Reload the views of a worksheet.
   * @param {object} [__namedParameters] - Options
   * @param {boolean} [__namedParameters.invalidateCaches] - When true, caches will be invalidated for objecttypes used
   *   in the worksheet
   * @return {Promise<void>} A `Promise` which resolves when the views of the worksheet have finished reloading
   * @postMessage
   */
  reload({ invalidateCaches = false } = {}) {
    this.#log('CadenzaClient#reload', ...arguments);
    return this.#postRequest('reload', { invalidateCaches });
  }

  /**
   * Sends a message to parent Cadenza window to close the window containing this application
   * @postMessageParent
   */
  closeMe() {
    this.#log('CadenzaClient#closeMe');
    assert(this.#iframe == null, 'Cannot send closeMe to iframe');
    this.#postEvent('closeMe');
  }

  /**
   * Show a workbook map view in an iframe.
   *
   * @param {EmbeddingTargetId} mapView - The workbook map view to show
   * @param {object} [__namedParameters] - Options
   * @param {UiFeature[]} [__namedParameters.disabledUiFeatures] - Cadenza UI features to disable
   * @param {boolean} [__namedParameters.expandNavigator] - Indicates if the navigator should be expanded.
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {Geometry} [__namedParameters.geometry] - A geometry to show on the map
   * @param {boolean} [__namedParameters.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer
   * @param {boolean} [__namedParameters.hideWorkbookToolBar] - Whether to hide the workbook toolbar
   * @param {GlobalId} [__namedParameters.highlightGlobalId] - The ID of an item to highlight / expand in the navigator
   * @param {string} [__namedParameters.locationFinder] - A search query for the location finder
   * @param {Extent} [__namedParameters.mapExtent] - A map extent to set
   * @param {OperationMode} [__namedParameters.operationMode] - The mode in which a workbook should be operated
   * @param {boolean} [__namedParameters.useMapSrs] -  Whether the geometry and the extent are in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {ExtentStrategy} [__namedParameters.extentStrategy] - Strategy to define the initial map extent. A given extentStrategy
   *    trumps zooming to a specified mapExtent
   *    which trumps zooming to a locationFinder result
   *    which trumps zooming to the initial extent of the opened mapView.
   *    If a specified {@link GeometryExtentStrategy} doesn't contain a 'geometry', the 'geometry' of this API call is used.
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaDrillThroughEvent}
   * - {@link CadenzaActionEvent}
   * @embed
   */
  async showMap(
    mapView,
    {
      disabledUiFeatures,
      expandNavigator,
      filter,
      geometry,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      highlightGlobalId,
      locationFinder,
      mapExtent,
      operationMode,
      useMapSrs,
      extentStrategy,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#showMap', ...arguments);
    if (geometry) {
      assertValidGeometryType(geometry.type);
    }
    const validExtentStrategy = sanitizeExtentStrategy({
      geometry,
      extentStrategy,
    });
    const zoomToGeometry =
      validExtentStrategy?.type === 'geometry' &&
      validExtentStrategy?.geometry === geometry;
    const params = createParams({
      disabledUiFeatures,
      expandNavigator,
      filter,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      highlightGlobalId,
      // only use locationFinder if zoom to geometry is not set, to avoid
      // zooming race condition for Cadenza versions below 10.1
      locationFinder: zoomToGeometry ? undefined : locationFinder,
      mapExtent,
      operationMode,
      targetType: 'MAP',
      useMapSrs,
    });
    await this.#show(resolvePath(mapView), params, signal);
    if (geometry) {
      this.#postEvent('setGeometry', {
        geometry,
        zoomToGeometry,
      });
    }
    if (!zoomToGeometry && validExtentStrategy) {
      this.#setExtentStrategy(validExtentStrategy);
    }
  }

  /**
   * Expand/collapse the navigator.
   *
   * @param {boolean} expanded - The expansion state of the navigator
   * @postMessage
   */
  expandNavigator(expanded = true) {
    this.#log('CadenzaClient#expandNavigator', ...arguments);
    this.#postEvent('expandNavigator', { expandNavigator: Boolean(expanded) });
  }

  /**
   * Get data from the currently shown workbook view.
   *
   * Currently, only map views are supported.
   *
   * @hidden
   * @template {DataType} T
   * @param {T} dataType - The requested data type. Currently, only `"png"` is supported.
   * @return {Promise<T extends 'png' ? Blob : never>}
   * @postMessage
   */
  async getData(dataType) {
    this.#log('CadenzaClient#getData', ...arguments);
    assertSupportedDataType(dataType, ['png']);
    return this.#postRequest('getData', { dataType });
  }

  /**
   * Set filter variables in the currently shown workbook.
   *
   * @hidden
   * @param {FilterVariables} filter - The variable values
   * @return {Promise<void>} A `Promise` for when the filter variables were set.
   * @postMessage
   */
  setFilter(filter) {
    this.#log('CadenzaClient#setFilter', ...arguments);
    return this.#postRequest('setFilter', { filter });
  }

  /**
   * Set the visibility of a layer in the currently shown workbook map view.
   *
   * When making a layer visible, its ancestors will be made visible, too.
   * When hiding a layer, the ancestors are not affected.
   *
   * @hidden
   * @param {WorkbookLayerPath | string} layer - The layer to show or hide
   *   (identified using a layer path or a print name)
   * @param {boolean} visible - The visibility state of the layer
   * @return {Promise<void>} A `Promise` for when the layer visibility was set.
   * @postMessage
   */
  setLayerVisibility(layer, visible) {
    this.#log('CadenzaClient#setLayerVisibility', ...arguments);
    return this.#postRequest('setLayerVisibility', {
      layer: array(layer),
      visible,
    });
  }

  /**
   * Set the selection in the currently shown workbook map view.
   *
   * @hidden
   * @param {WorkbookLayerPath | string} layer - The data view layer to set the selection in
   * @param {unknown[][]} values - The IDs of the objects to select
   * @param {object} [__namedParameters]
   * @param {GeometryExtentStrategy} [__namedParameters.extentStrategy] - Strategy to define the new map extent
   * @return {Promise<void>} A `Promise` for when the selection was set.
   * @postMessage
   */
  setSelection(layer, values, { extentStrategy } = {}) {
    this.#log('CadenzaClient#setSelection', ...arguments);
    const selectionResult = this.#postRequest('setSelection', {
      layer: array(layer),
      values,
    });
    this.#setExtentStrategy(extentStrategy);
    return selectionResult;
  }

  /**
   * Zooms to the extent provided by the strategy
   *
   * @param {GeometryExtentStrategy} [extentStrategy] - Strategy to define the new map extent
   */
  #setExtentStrategy(extentStrategy) {
    const type = extentStrategy?.type;
    if (type === 'geometry') {
      this.#postEvent('setExtentStrategy', extentStrategy);
    }
  }

  /**
   * Add to the selection in the currently shown workbook map view.
   *
   * @hidden
   * @param {WorkbookLayerPath | string} layer - The data view layer to change the selection in
   * @param {unknown[][]} values - The IDs of the objects to select
   * @param {object} [__namedParameters]
   * @param {GeometryExtentStrategy} [__namedParameters.extentStrategy] - Strategy to define the new map extent
   * @return {Promise<void>} A `Promise` for when the selection was changed.
   * @postMessage
   */
  addSelection(layer, values, { extentStrategy } = {}) {
    this.#log('CadenzaClient#addSelection', ...arguments);
    const selectionResult = this.#postRequest('addSelection', {
      layer: array(layer),
      values,
    });
    this.#setExtentStrategy(extentStrategy);
    return selectionResult;
  }

  /**
   * Remove from the selection in the currently shown workbook map view.
   *
   * @hidden
   * @param {WorkbookLayerPath | string} layer - The data view layer to change the selection in
   * @param {unknown[][]} values - The IDs of the objects to unselect
   * @param {object} [__namedParameters]
   * @param {GeometryExtentStrategy} [__namedParameters.extentStrategy] - Strategy to define the new map extent
   * @return {Promise<void>} A `Promise` for when the selection was changed.
   * @postMessage
   */
  removeSelection(layer, values, { extentStrategy } = {}) {
    this.#log('CadenzaClient#removeSelection', ...arguments);
    const selectionResult = this.#postRequest('removeSelection', {
      layer: array(layer),
      values,
    });
    this.#setExtentStrategy(extentStrategy);
    return selectionResult;
  }

  /**
   * Create a geometry.
   *
   * _Note:_ Under the hood, creating a geometry is similar to editing a geometry.
   * That's why the events use the `editGeometry` prefix.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view in the background
   * @param {GeometryType} geometryType - The geometry type
   * @param {object} [__namedParameters] - Options
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {string} [__namedParameters.locationFinder] - A search query for the location finder
   * @param {Extent} [__namedParameters.mapExtent] - A map extent to set
   * @param {number} [__namedParameters.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {boolean} [__namedParameters.useMapSrs] - Whether the created geometry should use the map's SRS (otherwise EPSG:4326 will be used)
   * @param {OperationMode} [__namedParameters.operationMode] - The mode in which a workbook should be operated
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaEditGeometryUpdateEvent}
   * - {@link CadenzaEditGeometryOkEvent}
   * - {@link CadenzaEditGeometryCancelEvent}
   * @embed
   */
  createGeometry(
    backgroundMapView,
    geometryType,
    {
      filter,
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      operationMode,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#createGeometry', ...arguments);
    const params = createParams({
      action: 'editGeometry',
      filter,
      geometryType,
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      operationMode,
    });
    return this.#show(resolvePath(backgroundMapView), params, signal);
  }

  /**
   * Edit a geometry.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view in the background
   * @param {Geometry} geometry - The geometry
   * @param {object} [__namedParameters] - Options
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {string} [__namedParameters.locationFinder] - A search query for the location finder
   * @param {Extent} [__namedParameters.mapExtent] - A map extent to set
   * @param {number} [__namedParameters.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {boolean} [__namedParameters.useMapSrs] - Whether the geometry is in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {OperationMode} [__namedParameters.operationMode] - The mode in which a workbook should be operated
   * @param {ExtentStrategy} [__namedParameters.extentStrategy] - Strategy to define the initial map extent. A given extentStrategy
   *    trumps zooming to a specified mapExtent
   *    which trumps zooming to a locationFinder result
   *    which trumps zooming to the initial extent of the opened mapView.
   *    If a specified {@link GeometryExtentStrategy} doesn't contain a 'geometry', the 'geometry' of this API call is used.
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaEditGeometryUpdateEvent}
   * - {@link CadenzaEditGeometryOkEvent}
   * - {@link CadenzaEditGeometryCancelEvent}
   * @embed
   */
  async editGeometry(
    backgroundMapView,
    geometry,
    {
      filter,
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      extentStrategy,
      operationMode,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#editGeometry', ...arguments);
    assertValidGeometryType(geometry.type);
    const validExtentStrategy = sanitizeExtentStrategy({
      geometry,
      extentStrategy,
    });
    const zoomToGeometry =
      validExtentStrategy?.type === 'geometry' &&
      validExtentStrategy?.geometry === geometry;
    const params = createParams({
      action: 'editGeometry',
      filter,
      // only use locationFinder if zoom to geometry is not set, to avoid
      // zooming race condition for Cadenza versions below 10.1
      locationFinder: zoomToGeometry ? undefined : locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      operationMode,
    });
    await this.#show(resolvePath(backgroundMapView), params, signal);
    if (geometry) {
      this.#postEvent('setGeometry', {
        geometry,
        zoomToGeometry,
      });
    }
    if (!zoomToGeometry && validExtentStrategy) {
      this.#setExtentStrategy(validExtentStrategy);
    }
  }

  /**
   * Set custom validity state of the geometry editor in addition to the default validation state (including errors and
   * warnings). When set to error the dialog submission is blocked.
   * If there already is a custom state set it will override it.
   * Passing '' will reset the custom state to undefined, meaning no custom state is displayed.
   * If no geometry editing is started, the method call has no effect.
   * @param {string} message The message to show in the dialog
   * @param {CustomValidityType} [type] The type of message (defaults to 'error')
   */
  setCustomValidity(message, type = 'error') {
    assert(
      ['error', 'warning', 'info', 'success'].includes(type),
      `Invalid validity type: ${type}`,
    );
    this.#postEvent('setCustomValidity', { message, type });
  }

  /**
   * Select objects in a workbook map.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view
   * @param {object} [__namedParameters] - Options
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {(WorkbookLayerPath | string)[]} [__namedParameters.layers] - Layers to restrict the selection to
   *  (identified using layer paths or print names)
   * @param {string} [__namedParameters.locationFinder] - A search query for the location finder
   * @param {Extent} [__namedParameters.mapExtent] - A map extent to set
   * @param {boolean} [__namedParameters.useMapSrs] - Whether the geometry is in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {OperationMode} [__namedParameters.operationMode] - The mode in which a workbook should be operated
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaChangeSelectionEvent}
   * - {@link CadenzaObjectInfoEvent}
   * - {@link CadenzaSelectObjectsOkEvent}
   * - {@link CadenzaSelectObjectsCancelEvent}
   * @embed
   */
  selectObjects(
    backgroundMapView,
    {
      filter,
      layers,
      locationFinder,
      mapExtent,
      useMapSrs,
      operationMode,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#selectObjects', ...arguments);
    const params = createParams({
      action: 'selectObjects',
      filter,
      layers: layers?.map(array),
      locationFinder,
      mapExtent,
      useMapSrs,
      operationMode,
    });
    return this.#show(resolvePath(backgroundMapView), params, signal);
  }

  /**
   * @param {string} path
   * @param {URLSearchParams} params
   * @param {AbortSignal} [signal]
   * @return {Promise<void>}
   */
  #show(path, params, signal) {
    const waitForFirstEmbeddingTargetShown = !(hasCadenzaSession || isTest());

    /*
     * If we show multiple embedding targets at the same time,
     * there's a race condition in the session creation for guest users.
     * To work around that, we wait for the first embedding target to be shown
     * (which implicitly creates the session for all embedding targets).
     * Note: We do not wait in tests to keep them simple.
     */
    if (waitForFirstEmbeddingTargetShown && firstEmbeddingTargetShown != null) {
      return firstEmbeddingTargetShown.finally(() =>
        this.#show(path, params, signal),
      );
    }

    const webApplication = this.#webApplication;
    if (webApplication) {
      params.set('webApplicationLink', webApplication.externalLinkId);
      params.set('webApplicationLinkRepository', webApplication.repositoryName);
    }

    const url = this.#createUrl(path, params);
    this.#log('Load iframe', url.toString());
    this.#requiredIframe.src = url.toString();
    const promise = this.#getIframePromise(signal);

    if (waitForFirstEmbeddingTargetShown) {
      // Use Promise.allSettled() to handle Promise rejections.
      firstEmbeddingTargetShown ??= Promise.allSettled([promise]).then(
        ([{ status }]) => {
          firstEmbeddingTargetShown = undefined;
          hasCadenzaSession = status === 'fulfilled';
        },
      );
    }

    return promise;
  }

  #getIframePromise(/** @type AbortSignal | undefined */ signal) {
    const iframe = this.#requiredIframe;
    /** @type {EventListener} */
    let onerror;
    /** @type {EventListener} */
    let onabort;
    /** @type {(() => void)[]} */
    let unsubscribes;
    /** @type {Promise<void>} */
    const promise = new Promise((resolve, reject) => {
      onerror = () =>
        reject(new CadenzaError('loading-error', 'Loading failed'));
      iframe.addEventListener('error', onerror);

      if (signal) {
        onabort = () => {
          iframe.contentWindow?.stop();
          reject(new AbortError());
        };
        signal.addEventListener('abort', onabort);
      }

      unsubscribes = [
        this.#on('ready', () => resolve()),
        this.#on('error', (/** @type {CadenzaErrorEvent} */ event) => {
          const { type, message } = event.detail;
          reject(new CadenzaError(type, message ?? 'Loading failed'));
        }),
      ];
    });

    promise
      .then(
        () => this.#log('Iframe loaded'),
        (error) => this.#log('Iframe loading failed', error),
      )
      .finally(() => {
        iframe.removeEventListener('error', onerror);
        signal?.removeEventListener('abort', onabort);
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      });

    return promise;
  }

  /**
   * Subscribe to a `postMessage()` event.
   *
   * @template {CadenzaEventType} TYPE
   * @param {TYPE} type - The event type
   * @param {(event: CadenzaEvent<TYPE, CadenzaEventByType<TYPE>['detail']>) => void} subscriber - The subscriber function
   * @return {() => void} An unsubscribe function
   */
  on(type, subscriber) {
    return this.#on(type, subscriber);
  }

  /**
   * @template {CadenzaEventType | string} TYPE
   * @template [DETAIL=unknown]
   * @param {TYPE} type
   * @param {(event: CadenzaEvent<TYPE, DETAIL>) => void} subscriber
   * @return {() => void} An unsubscribe function
   */
  #on(type, subscriber) {
    const subscriptions = this.#subscriptions;
    if (subscriptions.length === 0) {
      window.addEventListener('message', this.#onMessage);
    }
    subscriptions.push([
      type,
      /** @type {(event: CadenzaEvent<never>) => void} */ (subscriber),
    ]);

    return () => {
      subscriptions.forEach(([subscriptionType, subscriptionSubscriber], i) => {
        if (
          subscriptionType === type &&
          subscriptionSubscriber === subscriber
        ) {
          subscriptions.splice(i, 1);
        }
      });
      if (subscriptions.length === 0) {
        window.removeEventListener('message', this.#onMessage);
      }
    };
  }

  // Use arrow function so that it's bound to this.
  #onMessage = (
    /** @type MessageEvent<CadenzaEvent<never, never>> */ event,
  ) => {
    if (event.origin !== this.#origin || event.source !== this.#targetWindow) {
      return;
    }

    const cadenzaEvent = event.data;
    this.#log('Received message', cadenzaEvent);
    this.#subscriptions.forEach(([type, subscriber]) => {
      if (type === cadenzaEvent.type) {
        subscriber(cadenzaEvent);
      }
    });
  };

  /**
   * Remove all subscriptions.
   *
   * @see {@link CadenzaClient#on}
   */
  destroy() {
    this.#subscriptions = [];
    window.removeEventListener('message', this.#onMessage);
  }

  /**
   * Posts an event to Cadenza and returns a `Promise` for the response.
   *
   * It is guaranteed that a response refers to a specific request,
   * even if multiple request are executed in parallel.
   * @template [T=void]
   * @param {string} type
   * @param {unknown} [detail]
   * @returns {Promise<T>}
   */
  #postRequest(type, detail) {
    const { port1, port2 } = new MessageChannel();
    const promise = new Promise((resolve, reject) => {
      port1.onmessage = (
        /** @type MessageEvent<CadenzaEvent<never, never>> */ event,
      ) => {
        const cadenzaEvent = event.data;
        if (cadenzaEvent.type === `${type}:success`) {
          resolve(cadenzaEvent.detail);
        } else if (cadenzaEvent.type === `${type}:error`) {
          reject();
        }
      };
    });
    this.#postEvent(type, detail, [port2]);
    return promise;
  }

  /**
   * @param {string} type
   * @param {unknown} [detail]
   * @param {Transferable[]} [transfer]
   */
  #postEvent(type, detail, transfer) {
    const cadenzaEvent = { type, detail };
    this.#log('postMessage', cadenzaEvent);
    const targetWindow = this.#targetWindow;
    assert(targetWindow != null, 'Cannot find target window');
    targetWindow.postMessage(cadenzaEvent, {
      targetOrigin: this.#origin,
      transfer,
    });
  }

  /**
   * Fetch data from a workbook view.
   *
   * @param {EmbeddingTargetId} source - The workbook view to fetch data from.
   * @param {DataType} dataType - The data type you want to get back from the server.
   *   Currently, `"csv"`, `"excel"` and `"json"` are supported for table and indicator views
   *   and `"pdf"` for views of type "JasperReports report".
   * @param {object} [__namedParameters] - Options
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {TablePart[]} [__namedParameters.parts] - Table parts to export; If not specified, all parts are exported.
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the data fetching
   * @return {Promise<Response>} A `Promise` for the fetch response
   * @throws For invalid arguments
   * @server
   */
  fetchData(source, dataType, { filter, parts, signal } = {}) {
    this.#log('CadenzaClient#fetchData', ...arguments);
    assertSupportedDataType(dataType, ['csv', 'excel', 'json', 'pdf']);
    const params = createParams({ dataType, filter, parts });
    return this.#fetch(resolvePath(source), params, signal);
  }

  /**
   * Fetch object info from a workbook map view.
   *
   * @param {EmbeddingTargetId} source - The workbook view to fetch object info from.
   * @param {(WorkbookLayerPath | string)[]} layerPath - Layer path to identify the layer
   *  (identified using layer paths or print names)
   * @param {unknown[][]} objectIds - The IDs of the objects to select
   * @param {object} [__namedParameters] - Options
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the data fetching
   * @param {Boolean} [__namedParameters.useMapSrs] - Use the map SRS instead of WGS84
   * @param {Boolean} [__namedParameters.fullGeometries] - Return non-simplified geometries
   * @return {Promise<FeatureCollection>} A `Promise` for the fetch response
   * @throws For invalid arguments
   */
  fetchObjectInfo(
    source,
    layerPath,
    objectIds,
    { filter, signal, useMapSrs, fullGeometries } = {},
  ) {
    this.#log('CadenzaClient#fetchObjectInfo', ...arguments);
    const params = createParams({
      filter,
    });
    return this.#fetch(
      resolvePath(source) + '/objectinfo',
      params,
      signal,
      JSON.stringify({
        objectIds,
        layerPath: array(layerPath),
        useMapSrs,
        fullGeometries,
      }),
    ).then((response) => response.json());
  }

  /**
   *  Fetch the intersection areas from a workbook map view layer in JSON format for a given area.
   *
   * @param {EmbeddingTargetId} source - The workbook view to fetch object info from.
   * @param {(WorkbookLayerPath | string)[]} layerPath - Layer path to identify the layer
   *  (identified using layer paths or print names)
   * @param {Geometry} geometry - The intersection geometry
   * @param {object} [__namedParameters] - Options
   * @param {boolean} [__namedParameters.useMapSrs]  - The intersection geometry and the result geometries are in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {Distance} [__namedParameters.buffer] - Buffer size for geometry of the transition
   * @param {AbortSignal} [__namedParameters.signal] - A signal to abort the data fetching
   * @return {Promise<FeatureCollection>} A `Promise` for the fetch response
   * @server
   */
  fetchAreaIntersections(
    source,
    layerPath,
    geometry,
    { useMapSrs, buffer, signal } = {},
  ) {
    this.#log('CadenzaClient#areaIntersections', ...arguments);
    const params = createParams({});
    return this.#fetch(
      resolvePath(source) + '/area-intersections',
      params,
      signal,
      JSON.stringify({
        layerPath: array(layerPath),
        geometry: geometry,
        useMapSrs: useMapSrs,
        buffer: buffer,
      }),
    ).then((response) => response.json());
  }

  async #fetch(
    /** @type string */ path,
    /** @type URLSearchParams */ params,
    /** @type AbortSignal | undefined */ signal,
    /** @type String | undefined If body is set, the fetch will be a post.*/ body,
  ) {
    const url = this.#createUrl(path, params);
    this.#log('Fetch', url.toString());
    const method = body ? 'POST' : undefined;
    const headers = new Headers();
    headers.set('X-Requested-With', 'XMLHttpRequest');
    if (body) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(url, {
      signal,
      method,
      headers,
      body,
    });
    if (!res.ok) {
      const errorType =
        {
          400: 'bad-request',
          401: 'unauthorized',
          404: 'not-found',
        }[res.status] ?? 'internal-error';
      throw new CadenzaError(errorType, 'Failed to fetch data');
    }
    return res;
  }

  /**
   * Download data from a workbook view.
   *
   * _Note:_ The file name, if not provided, is generated from the name of the workbook view and the current date.
   *
   * @param {EmbeddingTargetId} source - The workbook view to fetch data from.
   * @param {DataType} dataType - The data type you want to get back from the server.
   *   Currently, `"csv"`, `"excel"` and `"json"` are supported for table and indicator views
   *   and `"pdf"` for views of type "JasperReports report".
   * @param {object} [__namedParameters] - Options
   * @param {string} [__namedParameters.fileName] - The file name to use; The file extension is appended by Cadenza.
   * @param {FilterVariables} [__namedParameters.filter] - Filter variables
   * @param {TablePart[]} [__namedParameters.parts] - Table parts to export; If not specified, all parts are exported.
   * @throws For invalid arguments
   * @server
   */
  downloadData(source, dataType, { fileName, filter, parts } = {}) {
    this.#log('CadenzaClient#downloadData', ...arguments);
    assertSupportedDataType(dataType, ['csv', 'excel', 'json', 'pdf']);
    const params = createParams({ dataType, fileName, filter, parts });
    this.#download(resolvePath(source), params);
  }

  #download(/** @type string */ path, /** @type URLSearchParams */ params) {
    const url = this.#createUrl(path, params);
    const a = document.createElement('a');
    a.href = url.toString();
    // causes the file to be downloaded even if the server sends a "Content-disposition: inline" header
    a.download = '';
    a.hidden = true;
    document.body.append(a);
    a.click();
    a.remove();
  }

  #createUrl(/** @type string */ path, /** @type URLSearchParams */ params) {
    assert(this.#baseUrl != null, 'Required base URL is not present');
    const url = new URL(this.baseUrl + path);
    if (params) {
      for (const [param, value] of params) {
        url.searchParams.append(param, value);
      }
    }
    return url;
  }

  #log(/** @type unknown[] */ ...args) {
    if (this.#debug) {
      /** @type {unknown[]} */
      const redundantValues = [undefined, '', false];
      /** @type {(value: unknown) => value is object} */
      const isObject = (/** @type {unknown} */ value) =>
        value != null && typeof value === 'object';
      const sanitizedArgs = args
        .map((arg) => {
          if (isObject(arg)) {
            return Object.fromEntries(
              Object.entries(arg).filter(
                ([, value]) => !redundantValues.includes(value),
              ),
            );
          }
          return arg;
        })
        .filter(
          (arg) =>
            !redundantValues.includes(arg) &&
            !(isObject(arg) && Object.keys(arg).length === 0),
        );
      console.log(...sanitizedArgs);
    }
  }
}

function resolvePath(/** @type PageSource | EmbeddingTargetId */ source) {
  if (typeof source === 'string') {
    assert(
      validKebabCaseString(source),
      `Invalid embedding target ID: ${source}`,
    );
    return `/w/${source}`;
  } else {
    const page = source.page;
    assert(validPageName(page), `Invalid page name: ${page}`);
    return `/public/pages/${page}`;
  }
}

function assert(/** @type boolean */ assertion, /** @type string */ message) {
  if (!assertion) {
    throw new Error(message);
  }
}

function validUrl(/** @type string */ value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validPageName(/** @type string */ value) {
  return ['welcome'].includes(value);
}

function validKebabCaseString(/** @type string */ value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validRepositoryName(/** @type string */ value) {
  return /^[\w -]{1,255}$/.test(value);
}

function validBase64String(/** @type string */ value) {
  try {
    // Workbook IDs are url-safe base64 strings.
    // https://stackoverflow.com/a/44528376
    atob(value.replace(/_/g, '/').replace(/-/g, '+'));
    return value !== '';
  } catch {
    return false;
  }
}

function validExternalLinkKey(/** @type ExternalLinkKey */ linkKey) {
  return (
    validRepositoryName(linkKey.repositoryName) &&
    validBase64String(linkKey.externalLinkId)
  );
}

function assertValidGeometryType(/** @type string */ value) {
  assert(validGeometryType(value), `Invalid geometry type: ${value}`);
}

function validGeometryType(/** @type string */ value) {
  return [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
  ].includes(value);
}

function validTablePart(/** @type TablePart */ value) {
  return ['columns', 'values', 'totals'].includes(value);
}

function validOperationMode(/** @type string */ value) {
  return ['normal', 'simplified'].includes(value);
}

function validUiFeature(/** @type string */ value) {
  return ['workbook-design', 'workbook-view-management'].includes(value);
}

function assertSupportedDataType(
  /** @type DataType */ type,
  /** @type DataType[] */ supportedTypes,
) {
  assert(supportedTypes.includes(type), `Invalid data type: ${type}`);
}

/**
 * @param {object} params
 * @param {string} [params.action]
 * @param {DataType} [params.dataType]
 * @param {UiFeature[]} [params.disabledUiFeatures]
 * @param {boolean} [params.expandNavigator]
 * @param {string} [params.fileName]
 * @param {FilterVariables} [params.filter]
 * @param {GeometryType} [params.geometryType]
 * @param {boolean} [params.hideMainHeaderAndFooter]
 * @param {boolean} [params.hideWorkbookToolBar]
 * @param {GlobalId} [params.highlightGlobalId]
 * @param {string} [params.labelSet]
 * @param {WorkbookLayerPath[]} [params.layers]
 * @param {string} [params.locationFinder]
 * @param {Extent} [params.mapExtent]
 * @param {number} [params.minScale]
 * @param {OperationMode} [params.operationMode]
 * @param {TablePart[]} [params.parts]
 * @param {'MAP'} [params.targetType]
 * @param {boolean} [params.useMapSrs]
 * @return {URLSearchParams}
 */
function createParams({
  action,
  dataType,
  disabledUiFeatures,
  expandNavigator,
  fileName,
  filter,
  geometryType,
  hideMainHeaderAndFooter,
  hideWorkbookToolBar,
  highlightGlobalId,
  labelSet,
  layers,
  locationFinder,
  mapExtent,
  minScale,
  operationMode,
  parts,
  targetType,
  useMapSrs,
}) {
  if (disabledUiFeatures) {
    disabledUiFeatures.forEach((feature) =>
      assert(validUiFeature(feature), `Invalid UI feature: ${feature}`),
    );
  }
  if (filter) {
    Object.keys(filter).forEach((varName) =>
      assert(
        validKebabCaseString(varName),
        `Invalid filter variable name: ${varName}`,
      ),
    );
  }
  if (geometryType) {
    assertValidGeometryType(geometryType);
  }
  if (operationMode) {
    assert(
      validOperationMode(operationMode),
      `Invalid operation mode: ${operationMode}`,
    );
  }
  if (parts) {
    parts.forEach((part) =>
      assert(validTablePart(part), `Invalid table part: ${part}`),
    );
  }
  return new URLSearchParams({
    ...(action && { action }),
    ...(dataType && { dataType }),
    ...(disabledUiFeatures && {
      disabledUiFeatures: disabledUiFeatures.join(),
    }),
    ...(expandNavigator && { expandNavigator: 'true' }),
    ...(fileName && { fileName }),
    ...(filter &&
      Object.fromEntries(
        Object.entries(filter).map(([variable, value]) => [
          `filter.${variable}`,
          JSON.stringify(value instanceof Date ? value.toISOString() : value),
        ]),
      )),
    ...(geometryType && { geometryType }),
    ...(hideMainHeaderAndFooter && { hideMainHeaderAndFooter: 'true' }),
    ...(hideWorkbookToolBar && { hideWorkbookToolBar: 'true' }),
    ...(highlightGlobalId && { highlightGlobalId }),
    ...(labelSet && { labelSet }),
    ...(layers &&
      layers.length && {
        layers: JSON.stringify(layers),
      }),
    ...(locationFinder && { locationFinder }),
    ...(mapExtent && { mapExtent: mapExtent.join() }),
    ...(minScale && { minScale: String(minScale) }),
    ...(operationMode && { operationMode }),
    ...(parts && { parts: parts.join() }),
    ...(targetType && { targetType }),
    ...(useMapSrs && { useMapSrs: 'true' }),
  });
}

function array(/** @type unknown */ value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * Creates a valid extent strategy
 *
 * If the result is not a valid extent strategy, the return value is undefined.
 *
 * @param {object} __namedParameters
 * @param {Geometry} [__namedParameters.geometry]
 * @param {ExtentStrategy} [__namedParameters.extentStrategy]
 * @return {ExtentStrategy | undefined}
 */
function sanitizeExtentStrategy({ extentStrategy, geometry } = {}) {
  if (extentStrategy) {
    switch (extentStrategy.type) {
      case 'geometry':
        geometry = extentStrategy.geometry ?? geometry;
        if (geometry) {
          return { type: 'geometry', geometry };
        }
        break;
      default:
        return extentStrategy;
    }
  }
}

// Please do not add internal event types like 'ready' here.
/**
 * @typedef {'action'
 * | 'change:selection'
 * | 'drillThrough'
 * | 'editGeometry:ok'
 * | 'editGeometry:update'
 * | 'editGeometry:cancel'
 * | 'objectInfo'
 * | 'selectObjects:ok'
 * | 'selectObjects:cancel'
 * | 'reload'
 * } CadenzaEventType - An event type to subscribe to using {@link CadenzaClient#on}
 */

/**
 * @template {CadenzaEventType} T
 * @typedef {T extends 'action' ? CadenzaActionEvent
 *  : T extends 'change:selection' ? CadenzaChangeSelectionEvent
 *  : T extends 'drillThrough' ? CadenzaDrillThroughEvent
 *  : T extends 'editGeometry:update' ? CadenzaEditGeometryUpdateEvent
 *  : T extends 'editGeometry:ok' ? CadenzaEditGeometryOkEvent
 *  : T extends 'editGeometry:cancel' ? CadenzaEditGeometryCancelEvent
 *  : T extends 'objectInfo' ? CadenzaObjectInfoEvent
 *  : T extends 'selectObjects:ok' ? CadenzaSelectObjectsOkEvent
 *  : T extends 'selectObjects:cancel' ? CadenzaSelectObjectsCancelEvent
 *  : T extends 'reload' ? CadenzaReloadEvent
 *  : never
 * } CadenzaEventByType
 */

/**
 * @template {CadenzaEventType | string} TYPE
 * @template [DETAIL=unknown]
 * @typedef CadenzaEvent - A Cadenza `postMessage()` event
 * @property {TYPE} type - The event type
 * @property {DETAIL} detail - Optional event details (depending on the event type)
 */
/**
 * @typedef {CadenzaEvent<'action', {context: string}>} CadenzaActionEvent - When the user executed a POST message action, which is defined on an external link in the Cadenza management center.
 */
/*
 * @hidden
 * @typedef {CadenzaEvent<'change:extent', {extent: Extent}>} CadenzaChangeExtentEvent - When the user moved the map.
 *   The extent is transformed according to the `useMapSrs` option.
 */
/**
 * @typedef {CadenzaEvent<'change:selection', undefined | {layer: WorkbookLayerPath, values: unknown[][]}>} CadenzaChangeSelectionEvent - When the user changed the selection.
 *
 * For a selection in a workbook map view with activated feature info, the values also include the simplified geometries of the selected objects.
 */
/**
 * @typedef {CadenzaEvent<'drillThrough', {context?: string, values: unknown[][]}>} CadenzaDrillThroughEvent - When the user executed a POST message drill-through.
 * <p>
 * The event includes a data row for every item in the workbook selection, each row consisting of the values of
 * the attributes that were selected for the POST message content. If the drill-through was executed from a map
 * view, each row includes the geometry of the selected object as the last value.
 * <p>
 * See also: <a href="../index.html#md:json-representation-of-cadenza-object-data">JSON Representation of Cadenza Object Data</a>
 */
/** @typedef {CadenzaEvent<'editGeometry:update', {geometry: Geometry}>} CadenzaEditGeometryUpdateEvent - When the user changed the geometry. */
/** @typedef {CadenzaEvent<'editGeometry:ok', {geometry: Geometry}>} CadenzaEditGeometryOkEvent - When the user submitted the geometry. */
/** @typedef {CadenzaEvent<'editGeometry:cancel'>} CadenzaEditGeometryCancelEvent - When the user cancelled the geometry editing. */
/** @typedef {CadenzaEvent<'error', {type: string, message?: string}>} CadenzaErrorEvent - An error event that is mapped to a {@link CadenzaError} */
/** @typedef {CadenzaEvent<'objectInfo', {layer: WorkbookLayerPath, objectInfos: {selectionIndex: number, elements: {attributePrintName: string, formattedValue: string}[]}}>} CadenzaObjectInfoEvent - When the user opened the object info flyout. */
/**
 * @typedef {CadenzaEvent<'selectObjects:ok', {layer: WorkbookLayerPath, values: unknown[][]}>} CadenzaSelectObjectsOkEvent - When the user submitted the selection.
 *
 * For a selection in a workbook map view with activated feature info, the values also include the simplified geometries of the selected objects.
 */
/** @typedef {CadenzaEvent<'selectObjects:cancel'>} CadenzaSelectObjectsCancelEvent - When the user cancelled the selection. */
/**
 * @typedef {CadenzaEvent<'reload'>} CadenzaReloadEvent - When the user clicked on the 'reload' button in the embedding standby page
 *
 * If a user does not interact with the iframe displaying the Cadenza content for a while, a standby embed page is displayed
 * and the user can click a reload button there. Then the application using Cadenza JS can re-trigger the loading of the iframe
 * with the correct original URL and parameters and do what was originally done when displaying that iframe.
 */

export class AbortError extends DOMException {
  constructor() {
    super('Aborted', 'AbortError');
  }
}

/**
 * An `Error` implementation for errors in the communication with Cadenza.
 *
 * _Note:_ For invalid parameters, the Cadenza client will throw "normal" `Error`s.
 */
export class CadenzaError extends Error {
  #type;

  /**
   * @param {string} type - The technical identifier of the error
   * @param {string} message - A description of the error
   */
  constructor(type, message) {
    super(message);
    this.#type = type;
  }

  get type() {
    return this.#type;
  }
}

function isTest() {
  return location.href === 'test';
}
