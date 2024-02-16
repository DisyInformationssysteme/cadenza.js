/**
 * Creates an instance of the Cadenza JS client.
 *
 * @param {string} baseUrl - The base URL of the Cadenza server
 * @param {object} [options] - Options
 * @param {HTMLIFrameElement | string} [options.iframe] - An iframe for embedding Cadenza or the iframe's ID.
 *   The iframe is required only for methods that embed Cadenza in an iframe, so e.g. not for {@link CadenzaClient#fetchData}.
 *   If you want to embed Cadenza in multiple iframes, you need to create an instance of the `CadenzaClient` per iframe.
 * @param {ExternalLinkKey} [options.webApplication] - An external link that Cadenza uses to resolve the
 *   [target origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin) when posting events.
 *   This is required if Cadenza and your application are not running on the same origin.
 * @param {boolean} [options.debug] - Whether to enable debug logging
 * @throws For invalid arguments
 */
export function cadenza(baseUrl, options) {
  return new CadenzaClient(baseUrl, options);
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
 * @typedef {string} EmbeddingTargetId - The ID of a Cadenza embedding target
 *
 * Embedding targets are called 🇩🇪 "Einbettbarer Inhalt" / 🇺🇸 "Embeddable content" throughout the Cadenza UI and help.
 * They're managed within the respective workbook:
 *
 * - 🇩🇪 "Mehr" > "Arbeitsmappe verwalten" > "Einbettung"
 * - 🇺🇸 "More" > "Manage workbook" > "Embedding"
 *
 * The name of an embedding target (as entered in the UI) is its ID.
 */

/** @typedef {string} GlobalId - The ID of a navigator item */

/**
 * @typedef ExternalLinkKey - A tuple qualifying a Cadenza external link
 *
 * You get the `repositoryName` and `externalLinkId` from the URL of the external link's page in the Cadenza management center:
 * ```
 * {baseUrl}/admin/repositories/{repositoryName}/external-links/{externalLinkId}?...
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
 * @typedef {'csv' | 'excel' | 'json' | 'pdf' | 'png'} DataType - A data type
 *
 * See [JSON Representation of Cadenza Object Data](../index.html#md:json-representation-of-cadenza-object-data) for JSON data.
 */
/** @typedef {'columns' | 'values' | 'totals'} TablePart - A part of a table to export */
/** @typedef {Record<string, string | string[] | number | Date | null>} FilterVariables - Filter variable names and values */
/**
 * _Notes:_
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
   * @hidden
   * @param {string} baseUrl
   * @param {object} [options]
   * @param {HTMLIFrameElement | string} [options.iframe]
   * @param {ExternalLinkKey} [options.webApplication]
   * @param {boolean} [options.debug]
   */
  constructor(baseUrl, { debug = false, iframe, webApplication } = {}) {
    assert(validUrl(baseUrl), `Invalid baseUrl: ${baseUrl}`);
    if (webApplication) {
      assert(
        validExternalLinkKey(webApplication),
        `Invalid webApplication parameter: ${webApplication}`,
      );
    }

    // Remove trailing /
    if (baseUrl.at(-1) === '/') {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    this.#baseUrl = baseUrl;
    this.#origin = new URL(baseUrl).origin;
    this.#iframe = iframe;
    this.#debug = debug;
    this.#webApplication = webApplication;

    this.#log('Create Cadenza client', baseUrl, iframe);
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

  get #requiredIframe() {
    const iframe = this.iframe;
    assert(
      iframe instanceof HTMLIFrameElement,
      'Required iframe is not present.',
    );
    return /** @type {HTMLIFrameElement} */ (iframe);
  }

  /**
   * Show a page, workbook, worksheet or workbook view in an iframe.
   *
   * @param {PageSource | EmbeddingTargetId} source - The source to show
   * @param {object} [options]
   * @param {DataType} [options.dataType] - Set to 'pdf' for views of type "JasperReports report"
   *     to show the report PDF directly, without any Cadenza headers or footers.
   * @param {UiFeature[]} [options.disabledUiFeatures] - Cadenza UI features to disable
   * @param {boolean} [options.expandNavigator] - Indicates if the navigator should be expanded.
   * @param {FilterVariables} [options.filter] - Filter variables
   * @param {boolean} [options.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer
   * @param {boolean} [options.hideWorkbookToolBar] - Whether to hide the workbook toolbar
   * @param {GlobalId} [options.highlightGlobalId] - The ID of an item to highlight / expand in the navigator
   * @param {String} [options.labelSet] - The name of a label set defined in the `basicweb-config.xml` (only supported for the welcome page)
   * @param {OperationMode} [options.operationMode] - The mode in which a workbook should be operated
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires {@link CadenzaDrillThroughEvent}
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
   * Show a workbook map view in an iframe.
   *
   * @param {EmbeddingTargetId} mapView - The workbook map view to show
   * @param {object} [options] - Options
   * @param {UiFeature[]} [options.disabledUiFeatures] - Cadenza UI features to disable
   * @param {boolean} [options.expandNavigator] - Indicates if the navigator should be expanded.
   * @param {FilterVariables} [options.filter] - Filter variables
   * @param {Geometry} [options.geometry] - A geometry to show on the map
   * @param {boolean} [options.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer
   * @param {boolean} [options.hideWorkbookToolBar] - Whether to hide the workbook toolbar
   * @param {GlobalId} [options.highlightGlobalId] - The ID of an item to highlight / expand in the navigator
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {OperationMode} [options.operationMode] - The mode in which a workbook should be operated
   * @param {boolean} [options.useMapSrs] -  Whether the geometry and the extent are in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaChangeExtentEvent}
   * - {@link CadenzaDrillThroughEvent}
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
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#showMap', ...arguments);
    if (geometry) {
      assertValidGeometryType(geometry.type);
    }
    const params = createParams({
      disabledUiFeatures,
      expandNavigator,
      filter,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      highlightGlobalId,
      locationFinder,
      mapExtent,
      operationMode,
      useMapSrs,
    });
    await this.#show(resolvePath(mapView), params, signal);
    if (geometry) {
      this.#postEvent('setGeometry', { geometry });
    }
  }

  /**
   * Expand/collapse the navigator.
   *
   * @param {boolean} expanded - The expansion state of the navigator
   */
  expandNavigator(expanded = true) {
    this.#log('CadenzaClient#expandNavigator', ...arguments);
    this.#postEvent('expandNavigator', { expandNavigator: Boolean(expanded) });
  }

  /**
   * Set filter variables in the currently shown workbook.
   *
   * @param {FilterVariables} filter - The variable values
   * @return {Promise<unknown>} A `Promise` for when the filter variables were set.
   */
  setFilter(filter) {
    this.#log('CadenzaClient#setFilter', ...arguments);
    return this.#postRequest('setFilter', { filter });
  }

  /**
   * Create a geometry.
   *
   * _Note:_ Under the hood, creating a geometry is similar to editing a geometry.
   * That's why the events use the `editGeometry` prefix.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view in the background
   * @param {GeometryType} geometryType - The geometry type
   * @param {object} [options] - Options
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {number} [options.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {boolean} [options.useMapSrs] - Whether the created geometry should use the map's SRS (otherwise EPSG:4326 will be used)
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaEditGeometryUpdateEvent}
   * - {@link CadenzaEditGeometryOkEvent}
   * - {@link CadenzaEditGeometryCancelEvent}
   */
  createGeometry(
    backgroundMapView,
    geometryType,
    { locationFinder, mapExtent, minScale, useMapSrs, signal } = {},
  ) {
    this.#log('CadenzaClient#createGeometry', ...arguments);
    const params = createParams({
      action: 'editGeometry',
      geometryType,
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
    });
    return this.#show(resolvePath(backgroundMapView), params, signal);
  }

  /**
   * Edit a geometry.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view in the background
   * @param {Geometry} geometry - The geometry
   * @param {object} [options] - Options
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {number} [options.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {boolean} [options.useMapSrs] - Whether the geometry is in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaEditGeometryUpdateEvent}
   * - {@link CadenzaEditGeometryOkEvent}
   * - {@link CadenzaEditGeometryCancelEvent}
   */
  async editGeometry(
    backgroundMapView,
    geometry,
    { locationFinder, mapExtent, minScale, useMapSrs, signal } = {},
  ) {
    this.#log('CadenzaClient#editGeometry', ...arguments);
    assertValidGeometryType(geometry.type);
    const params = createParams({
      action: 'editGeometry',
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
    });
    await this.#show(resolvePath(backgroundMapView), params, signal);
    if (geometry) {
      this.#postEvent('setGeometry', { geometry });
    }
  }

  /**
   * Select objects in a workbook map.
   *
   * @param {EmbeddingTargetId} backgroundMapView - The workbook map view
   * @param {object} [options] - Options
   * @param {(WorkbookLayerPath | string)[]} [options.layers] - Layers to restrict the selection to
   *  (identified using layer paths or print names)
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {boolean} [options.useMapSrs] - Whether the geometry is in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A `Promise` for when the iframe is loaded
   * @throws For invalid arguments
   * @fires
   * - {@link CadenzaObjectInfoEvent}
   * - {@link CadenzaSelectObjectsUpdateEvent}
   * - {@link CadenzaSelectObjectsOkEvent}
   * - {@link CadenzaSelectObjectsCancelEvent}
   */
  selectObjects(
    backgroundMapView,
    { layers, locationFinder, mapExtent, useMapSrs, signal } = {},
  ) {
    this.#log('CadenzaClient#selectObjects', ...arguments);
    const params = createParams({
      action: 'selectObjects',
      layers: layers?.map(array),
      locationFinder,
      mapExtent,
      useMapSrs,
    });
    return this.#show(resolvePath(backgroundMapView), params, signal);
  }

  /**
   * Set the visibility of a layer in the currently shown workbook map view.
   *
   * When making a layer visible, its ancestors will be made visible, too.
   * When hiding a layer, the ancestors are not affected.
   *
   * @param {WorkbookLayerPath | string} layer - The layer to show or hide
   *   (identified using a layer path or a print name)
   * @param {boolean} visible - The visibility state of the layer
   * @return {Promise<unknown>} A `Promise` for when the layer visibility is set.
   */
  setLayerVisibility(layer, visible) {
    this.#log('CadenzaClient#setLayerVisibility', ...arguments);
    return this.#postRequest('setLayerVisibility', {
      layer: array(layer),
      visible,
    });
  }

  #show(
    /** @type string */ path,
    /** @type URLSearchParams */ params,
    /** @type AbortSignal | undefined */ signal,
  ) {
    const webApplication = this.#webApplication;
    if (webApplication) {
      params.set('webApplicationLink', webApplication.externalLinkId);
      params.set('webApplicationLinkRepository', webApplication.repositoryName);
    }

    const url = this.#createUrl(path, params);
    this.#log('Load iframe', url.toString());
    this.#requiredIframe.src = url.toString();
    return this.#getIframePromise(signal);
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

  #postRequest(/** @type string */ type, /** @type unknown */ detail) {
    /** @type {(() => void)[]} */
    let unsubscribes;
    /** @type {Promise<unknown>} */
    const promise = new Promise((resolve, reject) => {
      unsubscribes = [
        this.#on(`${type}:success`, ({ detail }) => resolve(detail)),
        this.#on(`${type}:error`, () => reject()),
      ];
    });
    promise.finally(() => unsubscribes.forEach((unsubscribe) => unsubscribe()));
    this.#postEvent(type, detail);
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
    if (
      event.origin !== this.#origin ||
      event.source !== this.#requiredIframe.contentWindow
    ) {
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

  #postEvent(/** @type string */ type, /** @type unknown */ detail) {
    const cadenzaEvent = { type, detail };
    this.#log('postMessage', cadenzaEvent);
    const contentWindow = /** @type {WindowProxy} */ (
      this.#requiredIframe.contentWindow
    );
    contentWindow.postMessage(cadenzaEvent, { targetOrigin: this.#origin });
  }

  /**
   * Fetch data from a workbook view.
   *
   * @param {EmbeddingTargetId} source - The workbook view to fetch data from.
   *   Currently only table and indicator views are supported.
   * @param {DataType} dataType - The data type you want to get back from the server.
   *   Currently, `"csv"`, `"excel"` and `"json"` are supported.
   * @param {object} options - Options
   * @param {TablePart[]} [options.parts] - Table parts to export; If not specified, all parts are exported.
   * @param {AbortSignal} [options.signal] - A signal to abort the data fetching
   * @return {Promise<Response>} A `Promise` for the fetch response
   * @throws For invalid arguments
   */
  fetchData(source, dataType, { parts, signal } = {}) {
    this.#log('CadenzaClient#fetchData', ...arguments);
    assertSupportedDataType(dataType, ['csv', 'excel', 'json']);
    const params = createParams({ dataType, parts });
    return this.#fetch(resolvePath(source), params, signal);
  }

  async #fetch(
    /** @type string */ path,
    /** @type URLSearchParams */ params,
    /** @type AbortSignal | undefined */ signal,
  ) {
    const url = this.#createUrl(path, params);
    this.#log('Fetch', url.toString());
    const res = await fetch(url, { signal });
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
   * Gets data via postMessage.
   *
   * @param {DataType} type - The requested data type
   * @return {Promise<unknown>} A `Promise` with the data of requested type
   * @description
   * Supported types:
   * - png: returns BitmapImage with the currently displayed map
   *
   */
  async getData(type) {
    this.#log('CadenzaClient#getData', ...arguments);
    if (type != 'png') {
      throw Error('The type ' + type + 'is not supported');
    }
    return this.#postRequest('getData', { type });
  }

  /**
   * Download data from a workbook view.
   *
   * _Note:_ The file name, if not provided, is generated from the name of the workbook view and the current date.
   *
   * @param {EmbeddingTargetId} source - The workbook view to download data from.
   *   Currently only table and indicator views are supported.
   * @param {DataType} dataType - The data type you want to get back from the server.
   *   Currently, `"csv"`, `"excel"` and `"json"` are supported.
   * @param {object} options - Options
   * @param {string} [options.fileName] - The file name to use; The file extension is appended by Cadenza.
   * @param {TablePart[]} [options.parts] - Table parts to export; If not specified, all parts are exported.
   * @throws For invalid arguments
   */
  downloadData(source, dataType, { fileName, parts }) {
    this.#log('CadenzaClient#downloadData', ...arguments);
    assertSupportedDataType(dataType, ['csv', 'excel', 'json']);
    const params = createParams({ dataType, fileName, parts });
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
    ...(operationMode && operationMode !== 'normal' && { operationMode }),
    ...(parts && { parts: parts.join() }),
    ...(useMapSrs && { useMapSrs: 'true' }),
  });
}

function array(/** @type unknown */ value) {
  return Array.isArray(value) ? value : [value];
}

// Please do not add internal event types like 'ready' here.
/**
 * @typedef {'change:extent'
 * | 'drillThrough'
 * | 'editGeometry:ok'
 * | 'editGeometry:update'
 * | 'editGeometry:cancel'
 * | 'objectInfo'
 * | 'selectObjects:ok'
 * | 'selectObjects:update'
 * | 'selectObjects:cancel'
 * } CadenzaEventType - An event type to subscribe to using {@link CadenzaClient#on}
 */

/**
 * @template {CadenzaEventType} T
 * @typedef { T extends 'change:extent' ? CadenzaChangeExtentEvent
 *  : T extends 'drillThrough' ? CadenzaDrillThroughEvent
 *  : T extends 'editGeometry:update' ? CadenzaEditGeometryUpdateEvent
 *  : T extends 'editGeometry:ok' ? CadenzaEditGeometryOkEvent
 *  : T extends 'editGeometry:cancel' ? CadenzaEditGeometryCancelEvent
 *  : T extends 'objectInfo' ? CadenzaObjectInfoEvent
 *  : T extends 'selectObjects:update' ? CadenzaEditGeometryUpdateEvent
 *  : T extends 'selectObjects:ok' ? CadenzaEditGeometryOkEvent
 *  : T extends 'selectObjects:cancel' ? CadenzaEditGeometryCancelEvent
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
 * @typedef {CadenzaEvent<'change:extent', {extent: Extent}>} CadenzaChangeExtentEvent - When the user moved the map.
 *   The extent is transformed according to the `useMapSrs` option.
 */
/**
 * @typedef {CadenzaEvent<'drillThrough', {values: unknown[][]}>} CadenzaDrillThroughEvent - When the user executed a POST message drill-through.
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
/** @typedef {CadenzaEvent<'objectInfo', {layer: WorkbookLayerPath, objectInfos: {selectionIndex: number, formattedValues: Record<string, string>}[]}>} CadenzaObjectInfoEvent - When the user opened the object info flyout. */
/** @typedef {CadenzaEvent<'selectObjects:update', {layer: WorkbookLayerPath, values: unknown[][]}>} CadenzaSelectObjectsUpdateEvent - When the user changed the selection. */
/** @typedef {CadenzaEvent<'selectObjects:ok', {layer: WorkbookLayerPath, values: unknown[][]}>} CadenzaSelectObjectsOkEvent - When the user submitted the selection. */
/** @typedef {CadenzaEvent<'selectObjects:cancel'>} CadenzaSelectObjectsCancelEvent - When the user cancelled the selection. */

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
