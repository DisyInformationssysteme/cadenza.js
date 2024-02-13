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

/** @typedef {string} EmbeddingTargetId - The ID of an embedding target */
/** @typedef {string} GlobalId - The ID of a navigator item */

/**
 * @typedef ExternalLinkKey - A tuple qualifying a Cadenza external link
 * @property {string} repositoryName - The name of the link's repository
 * @property {string} externalLinkId - The ID of the external link
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
 * * 'workbook-design' - The workbook designer
 * * 'workbook-view-management' - Add/Edit/Remove workbook views (Is included in 'workbook-design'.)
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

/** @typedef {'csv' | 'excel' | 'json' | 'pdf'} DataType - A data type */
/** @typedef {'columns' | 'values' | 'totals'} TablePart - A part of a table to export */
/** @typedef {Record<string, string | number | Date>} FilterVariables - Filter variable names and values */
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

  /** @type {[ string, (event: CadenzaEvent<never>) => void ][]} */
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
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For invalid arguments
   * @fires `drillThrough` - When the user executed a POST message drill-through.
   *   The event includes a row of values for each row in the workbook selection, each row consisting of the values of
   *   the attributes that were selected for the POST message content. If the drill-through was executed from a map
   *   view, each row includes the geometry of the select object as the last value.
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
    this.#log('CadenzaClient#show', source);
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
      webApplication: this.#webApplication,
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
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For invalid arguments
   * @fires `drillThrough` - When the user executed a POST message drill-through.
   *   The event includes a row of values for each row in the workbook selection, each row consisting of the values of
   *   the attributes that were selected for the POST message content plus the geometry of the select object as the last value.
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
    this.#log('CadenzaClient#showMap', mapView, geometry);
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
      webApplication: this.#webApplication,
    });
    await this.#show(resolvePath(mapView), params, signal);
    this.#postEvent('setGeometry', { geometry });
  }

  /**
   * Expand/collapse the navigator.
   *
   * @param {boolean} expanded - The expansion state of the navigator
   */
  expandNavigator(expanded = true) {
    this.#log('CadenzaClient#expandNavigator', expanded);
    this.#postEvent('expandNavigator', { expandNavigator: Boolean(expanded) });
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
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For invalid arguments
   * @fires `editGeometry:update` - When the user changed the geometry. The event includes the edited geometry.
   * @fires `editGeometry:ok` - When the user completed the geometry editing. The event includes the edited geometry.
   * @fires `editGeometry:cancel` - When the user cancelled the geometry editing in Cadenza.
   */
  createGeometry(
    backgroundMapView,
    geometryType,
    { locationFinder, mapExtent, minScale, useMapSrs, signal } = {},
  ) {
    this.#log('CadenzaClient#createGeometry', backgroundMapView, geometryType);
    const params = createParams({
      action: 'editGeometry',
      geometryType,
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      webApplication: this.#webApplication,
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
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For invalid arguments
   * @fires `editGeometry:update` - When the user changed the geometry. The event includes the edited geometry.
   * @fires `editGeometry:ok` - When the user completed the geometry editing. The event includes the edited geometry.
   * @fires `editGeometry:cancel` - When the user cancelled the geometry editing in Cadenza.
   */
  async editGeometry(
    backgroundMapView,
    geometry,
    { locationFinder, mapExtent, minScale, useMapSrs, signal } = {},
  ) {
    this.#log('CadenzaClient#editGeometry', backgroundMapView, geometry);
    assertValidGeometryType(geometry.type);
    const params = createParams({
      action: 'editGeometry',
      locationFinder,
      mapExtent,
      minScale,
      useMapSrs,
      webApplication: this.#webApplication,
    });
    await this.#show(resolvePath(backgroundMapView), params, signal);
    this.#postEvent('setGeometry', { geometry });
  }

  #show(
    /** @type string */ path,
    /** @type URLSearchParams */ params,
    /** @type AbortSignal | undefined */ signal,
  ) {
    const url = this.#createUrl(path, params);
    this.#log('Load iframe', url.toString());
    this.#requiredIframe.src = url.toString();
    return this.#getIframePromise(signal);
  }

  #getIframePromise(/** @type AbortSignal | undefined */ signal) {
    const iframe = this.#requiredIframe;
    /** @type {() => void} */
    let onerror;
    /** @type {() => void} */
    let onabort;
    /** @type {(() => void)[]} */
    let unsubscribes;
    /** @type {Promise<void>} */
    let promise = new Promise((resolve, reject) => {
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
        this.on('ready', () => resolve()),
        this.on('error', (/** @type {CadenzaErrorEvent} */ event) => {
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
   * @template [T=unknown]
   * @param {string} type - The event type
   * @param {(event: CadenzaEvent<T>) => void} subscriber - The subscriber function
   * @return {() => void} An unsubscribe function
   */
  on(type, subscriber) {
    const subscriptions = this.#subscriptions;
    if (subscriptions.length === 0) {
      window.addEventListener('message', this.#onMessage);
    }
    subscriptions.push([type, subscriber]);

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
  #onMessage = (/** @type MessageEvent<CadenzaEvent<never>> */ event) => {
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
   * @param {EmbeddingTargetId} source - The workbook view to fetch data from
   * @param {DataType} dataType - The data type you want to get back from the server
   * @param {object} options - Options
   * @param {TablePart[]} [options.parts] - Table parts to export; If not specified, all parts are exported.
   * @param {AbortSignal} [options.signal] - A signal to abort the data fetching
   * @return {Promise<Response>} A Promise for the fetch response
   * @throws For invalid arguments
   */
  fetchData(source, dataType, { parts, signal } = {}) {
    this.#log('CadenzaClient#fetchData', source, dataType);
    assertSupportedDataType(dataType);
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
   * Download data from a workbook view.
   *
   * _Note:_ The file name, if not provided, is generated from the name of the workbook view and the current date.
   *
   * @param {EmbeddingTargetId} source - The workbook view to download data from
   * @param {DataType} dataType - The data type you want to get back from the server
   * @param {object} options - Options
   * @param {string} [options.fileName] - The file name to use; The file extension is appended by Cadenza.
   * @param {TablePart[]} [options.parts] - Table parts to export; If not specified, all parts are exported.
   * @throws For invalid arguments
   */
  downloadData(source, dataType, { fileName, parts }) {
    this.#log('CadenzaClient#downloadData', source, dataType);
    assertSupportedDataType(dataType);
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
      console.log(...args);
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
  /** @type DataType[] */ supportedTypes = ['csv', 'excel', 'json', 'pdf'], // default: All types are supported.
) {
  assert(supportedTypes.includes(type), `Invalid data type: ${type}`);
}

/**
 * @param {object} params - Options
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
 * @param {string} [params.locationFinder]
 * @param {Extent} [params.mapExtent]
 * @param {number} [params.minScale]
 * @param {OperationMode} [params.operationMode]
 * @param {TablePart[]} [params.parts]
 * @param {boolean} [params.useMapSrs]
 * @param {ExternalLinkKey} [params.webApplication]
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
  locationFinder,
  mapExtent,
  minScale,
  parts,
  useMapSrs,
  webApplication,
  operationMode,
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
    ...(locationFinder && { locationFinder }),
    ...(mapExtent && { mapExtent: mapExtent.join() }),
    ...(minScale && { minScale: String(minScale) }),
    ...(operationMode && operationMode !== 'normal' && { operationMode }),
    ...(parts && { parts: parts.join() }),
    ...(useMapSrs && { useMapSrs: 'true' }),
    ...(webApplication && {
      webApplicationLink: webApplication.externalLinkId,
      webApplicationLinkRepository: webApplication.repositoryName,
    }),
  });
}

/**
 * @template [T=unknown]
 * @typedef CadenzaEvent - A Cadenza `postMessage()` event
 * @property {string} type - The event type
 * @property {T} detail - Optional event details (depending on the event type)
 */

/** @typedef {CadenzaEvent<{type: string, message?: string}>} CadenzaErrorEvent - An error event that is mapped to a {@link CadenzaError} */

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
