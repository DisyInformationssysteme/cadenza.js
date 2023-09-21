/**
 * Creates a new Cadenza instance of the Cadenza JS client.
 *
 * @param {string} baseUrl - The base URL of the Cadenza server
 * @param {object} [options] - Options
 * @param {HTMLIFrameElement | string} [options.iframe] - An iframe for embedding Cadenza or the iframe's ID
 * @param {ExternalLinkKey} [options.targetOrigin] - A external link id from which origin should be resolved when cadenza posts event
 * @param {boolean} [options.debug] - Whether to enable debug logging
 * @throws For invalid base URL
 */
export function cadenza(baseUrl, options) {
  return new CadenzaClient(baseUrl, options);
}

/* @ts-ignore */
const previousGlobalCadenza = globalThis.cadenza;
globalThis.cadenza = Object.assign(
  /** @param {Parameters<cadenza>} args */
  (...args) => cadenza(...args),
  {
    noConflict() {
      globalThis.cadenza = previousGlobalCadenza;
      return cadenza;
    },
  },
);

/** @typedef {string} EmbeddingTargetId - The ID of an embedding target */

/**
 * @typedef ExternalLinkKey - A tuple qualifying a cadenza external link
 * @property {string} repositoryName - The name of the link's repository
 * @property {string} externalLinkId - The ID of the external link
 */
/**
 * @typedef WorkbookKey - A tuple qualifying a workbook
 * @property {string} repositoryName - The name of the workbook's repository
 * @property {string} workbookId - The ID of the workbook
 */
/**
 * @typedef WorksheetKey - A tuple qualifying a worksheet
 * @property {string} repositoryName - The name of the workbook's repository
 * @property {string} workbookId - The ID of the workbook
 * @property {string} worksheetId - The ID of the worksheet
 */
/**
 * @typedef WorkbookViewKey - A tuple qualifying a workbook view
 * @property {string} repositoryName - The name of the workbook's repository
 * @property {string} workbookId - The ID of the workbook
 * @property {string} viewId - The ID of the view
 */

/** @typedef {EmbeddingTargetId | WorkbookKey} WorkbookSource - A workbook source */
/** @typedef {EmbeddingTargetId | WorksheetKey} WorksheetSource - A worksheet source */
/** @typedef {EmbeddingTargetId | WorkbookViewKey} WorkbookViewSource - A workbook view source */

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

  /** @readonly */
  /** @type {ExternalLinkKey | undefined} */
  #targetOrigin;

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
   * @param {ExternalLinkKey} [options.targetOrigin]
   * @param {boolean} [options.debug]
   */
  constructor(baseUrl, { debug = false, iframe, targetOrigin } = {}) {
    assert(validUrl(baseUrl), `Invalid baseUrl: ${baseUrl}`);

    // Remove trailing /
    if (baseUrl.at(-1) === '/') {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    this.#log('Create Cadenza client', baseUrl, iframe);

    this.#baseUrl = baseUrl;
    this.#origin = new URL(baseUrl).origin;
    this.#iframe = iframe;
    this.#debug = debug;
    this.#targetOrigin = targetOrigin;
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
   * Show a workbook, worksheet or workbook view in an iframe.
   *
   * @param {WorkbookSource | WorksheetSource | WorkbookViewSource} source - The source to show
   * @param {object} [options]
   * @param {boolean} [options.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer.
   * @param {boolean} [options.hideWorkbookToolBar] - Whether to hide the workbook toolbar.
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For an invalid source
   */
  show(source, { hideMainHeaderAndFooter, hideWorkbookToolBar, signal } = {}) {
    this.#log('CadenzaClient#show', source);
    const params = new URLSearchParams({
      ...(hideMainHeaderAndFooter && { hideMainHeaderAndFooter: 'true' }),
      ...(hideWorkbookToolBar && { hideWorkbookToolBar: 'true' }),
      ...(this.#targetOrigin && {
        webApplicationLink: this.#targetOrigin.externalLinkId,
        webApplicationLinkRepository: this.#targetOrigin.repositoryName,
      }),
    });
    return this.#show(resolvePath(source), { params, signal });
  }

  /**
   * Show a workbook map view in an iframe.
   *
   * @param {WorkbookViewSource} mapView - The workbook map view to show
   * @param {object} [options] - Options
   * @param {Geometry} [options.geometry] - A geometry to show on the map
   * @param {boolean} [options.hideMainHeaderAndFooter] - Whether to hide the main Cadenza header and footer.
   * @param {boolean} [options.hideWorkbookToolBar] - Whether to hide the workbook toolbar.
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {boolean} [options.useMapSrs] -  Whether the geometry and the extent are in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For an invalid workbook view source or geometry type
   */
  showMap(
    mapView,
    {
      geometry,
      hideMainHeaderAndFooter,
      hideWorkbookToolBar,
      locationFinder,
      mapExtent,
      useMapSrs,
      signal,
    } = {},
  ) {
    this.#log('CadenzaClient#showMap', mapView, geometry);
    if (geometry) {
      assertValidGeometryType(geometry.type);
    }
    const params = new URLSearchParams({
      ...(hideMainHeaderAndFooter && { hideMainHeaderAndFooter: 'true' }),
      ...(hideWorkbookToolBar && { hideWorkbookToolBar: 'true' }),
      ...(locationFinder && { locationFinder }),
      ...(mapExtent && { mapExtent: mapExtent.join() }),
      ...(useMapSrs && { useMapSrs: 'true' }),
      ...(this.#targetOrigin && {
        webApplicationLink: this.#targetOrigin.externalLinkId,
        webApplicationLinkRepository: this.#targetOrigin.repositoryName,
      }),
    });
    return this.#show(resolvePath(mapView), { params, signal }).then(() =>
      this.#postEvent('setGeometry', { geometry }),
    );
  }

  /**
   * Create a geometry.
   *
   * _Note:_ Under the hood, creating a geometry is similar to editing a geometry.
   * That's why the events use the `editGeometry` prefix.
   *
   * @param {WorkbookViewSource} backgroundMapView - The workbook map view in the background
   * @param {GeometryType} geometryType - The geometry type
   * @param {object} [options] - Options
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {boolean} [options.useMapSrs] - Whether the created geometry should use the map's SRS (otherwise EPSG:4326 will be used)
   * @param {number} [options.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For an invalid workbook view source or geometry type
   * @fires `editGeometry:update` - When the user changed the geometry. The event includes the edited geometry.
   * @fires `editGeometry:ok` - When the user completed the geometry editing. The event includes the edited geometry.
   * @fires `editGeometry:cancel` - When the user cancelled the geometry editing in Cadenza.
   */
  createGeometry(
    backgroundMapView,
    geometryType,
    { mapExtent, locationFinder, useMapSrs, minScale, signal } = {},
  ) {
    this.#log('CadenzaClient#createGeometry', backgroundMapView, geometryType);
    assertValidGeometryType(geometryType);
    const params = new URLSearchParams({
      action: 'editGeometry',
      geometryType,
      ...(useMapSrs && { useMapSrs: 'true' }),
      ...(locationFinder && { locationFinder }),
      ...(mapExtent && { mapExtent: mapExtent.join() }),
      ...(minScale && { minScale: String(minScale) }),
      ...(this.#targetOrigin && {
        webApplicationLink: this.#targetOrigin.externalLinkId,
        webApplicationLinkRepository: this.#targetOrigin.repositoryName,
      }),
    });
    return this.#show(resolvePath(backgroundMapView), { params, signal });
  }

  /**
   * Edit a geometry.
   *
   * @param {WorkbookViewSource} backgroundMapView - The workbook map view in the background
   * @param {Geometry} geometry - The geometry
   * @param {object} [options] - Options
   * @param {string} [options.locationFinder] - A search query for the location finder
   * @param {Extent} [options.mapExtent] - A map extent to set
   * @param {boolean} [options.useMapSrs] - Whether the geometry is in the map's SRS (otherwise EPSG:4326 is assumed)
   * @param {number} [options.minScale] - The minimum scale where the user should work on. A warning is shown when the map is zoomed out above the threshold.
   * @param {AbortSignal} [options.signal] - A signal to abort the iframe loading
   * @return {Promise<void>} A Promise for when the iframe is loaded
   * @throws For an invalid workbook view source
   * @fires `editGeometry:update` - When the user changed the geometry. The event includes the edited geometry.
   * @fires `editGeometry:ok` - When the user completed the geometry editing. The event includes the edited geometry.
   * @fires `editGeometry:cancel` - When the user cancelled the geometry editing in Cadenza.
   */
  editGeometry(
    backgroundMapView,
    geometry,
    { mapExtent, locationFinder, useMapSrs, minScale, signal } = {},
  ) {
    this.#log('CadenzaClient#editGeometry', backgroundMapView, geometry);
    assertValidGeometryType(geometry.type);
    const params = new URLSearchParams({
      action: 'editGeometry',
      ...(locationFinder && { locationFinder }),
      ...(mapExtent && { mapExtent: mapExtent.join() }),
      ...(useMapSrs && { useMapSrs: 'true' }),
      ...(minScale && { minScale: String(minScale) }),
      ...(this.#targetOrigin && {
        webApplicationLink: this.#targetOrigin.externalLinkId,
        webApplicationLinkRepository: this.#targetOrigin.repositoryName,
      }),
    });
    return this.#show(resolvePath(backgroundMapView), { params, signal }).then(
      () => this.#postEvent('setGeometry', { geometry }),
    );
  }

  /**
   * @param {string} path
   * @param {object} options
   * @param {URLSearchParams} [options.params]
   * @param {AbortSignal} [options.signal]
   */
  #show(path, { params, signal }) {
    const url = new URL(this.baseUrl + path);
    if (params) {
      for (const [param, value] of params) {
        url.searchParams.append(param, value);
      }
    }
    this.#log('Load iframe', url.toString());
    this.#requiredIframe.src = url.toString();
    return this.#getIframePromise(signal);
  }

  /**
   * @param {AbortSignal} [signal]
   */
  #getIframePromise(signal) {
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

    promise.then(
      () => this.#log('Iframe loaded'),
      (error) => this.#log('Iframe loading failed', error),
    );

    promise.finally(() => {
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

  /** @param {MessageEvent<CadenzaEvent<never>>} event */
  // Use arrow function so that it's bound to this.
  #onMessage = (event) => {
    this.#log('Received message', event);
    if (
      event.origin !== this.#origin ||
      event.source !== this.#requiredIframe.contentWindow
    ) {
      return;
    }

    const cadenzaEvent = event.data;
    this.#subscriptions.forEach(([type, subscriber]) => {
      if (type === cadenzaEvent.type) {
        subscriber(cadenzaEvent);
      }
    });
  };

  /**
   * @param {string} type
   * @param {unknown} detail
   */
  #postEvent(type, detail) {
    const event = { type, detail };
    this.#log('postMessage', event);
    const contentWindow = /** @type {WindowProxy} */ (
      this.#requiredIframe.contentWindow
    );
    contentWindow.postMessage(event, { targetOrigin: this.#origin });
  }

  /** @param {unknown[]} args */
  #log(...args) {
    if (this.#debug) {
      console.log(...args);
    }
  }
}

/** @param {WorkbookSource | WorksheetSource | WorkbookViewSource} source */
function resolvePath(source) {
  if (typeof source === 'string') {
    assert(
      validEmbeddingTargetId(source),
      `Invalid embedding target ID: ${source}`,
    );
    return `/w/${source}`;
  } else {
    const { repositoryName, workbookId } = source;
    assert(
      validRepositoryName(repositoryName),
      `Invalid repository name: ${repositoryName}`,
    );
    assert(validWorkbookId(workbookId), `Invalid workbook ID: ${workbookId}`);
    const path = `/public/repositories/${repositoryName}/workbooks/${workbookId}`;
    if ('worksheetId' in source) {
      const worksheetId = source.worksheetId;
      assert(
        validWorkbookId(worksheetId),
        `Invalid worksheet ID: ${worksheetId}`,
      );
      return `${path}/worksheets/${worksheetId}`;
    }
    if ('viewId' in source) {
      const viewId = source.viewId;
      assert(validWorkbookId(viewId), `Invalid view ID: ${viewId}`);
      return `${path}/views/${viewId}`;
    }
    return path;
  }
}

/**
 * @param {boolean} assertion
 * @param {string} message
 */
function assert(assertion, message) {
  if (!assertion) {
    throw new Error(message);
  }
}

/** @param {string} value */
function validUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} value */
function validEmbeddingTargetId(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** @param {string} value */
function validRepositoryName(value) {
  return /^[\w -]{1,255}$/.test(value);
}

/** @param {string} value */
function validWorkbookId(value) {
  try {
    // Workbook IDs are url-safe base64 strings.
    // https://stackoverflow.com/a/44528376
    atob(value.replace(/_/g, '/').replace(/-/g, '+'));
    return value !== '';
  } catch {
    return false;
  }
}

/** @param {string} value */
function assertValidGeometryType(value) {
  assert(validGeometryType(value), 'Invalid geometry type');
}

/** @param {string} value */
function validGeometryType(value) {
  return [
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
  ].includes(value);
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
