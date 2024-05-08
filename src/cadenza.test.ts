import {
  cadenza,
  CadenzaClient,
  CadenzaDrillThroughEvent,
  CadenzaError,
  EmbeddingTargetId,
  GlobalId,
  PageSource,
} from './cadenza.js';

const BASE_URL = 'http://example.com';
const EMBEDDING_TARGET_ID = 'embedding-target' as EmbeddingTargetId;
const EXTERNAL_LINK_ID = 'qwertzuioplkjhgfdsay';
const REPOSITORY_NAME = 'repository';

const EXTERNAL_LINK_KEY = {
  repositoryName: REPOSITORY_NAME,
  externalLinkId: EXTERNAL_LINK_ID,
};

const WELCOME_PAGE: PageSource = {
  page: 'welcome',
};

describe('cadenza()', () => {
  it('Is globally available, too, but the global can be removed', () => {
    expect(globalThis.cadenza.noConflict()).toBe(cadenza);
    expect(globalThis.cadenza).toBeUndefined();
  });

  it('Throws for an invalid base URL', () =>
    expect(() => cadenza('')).toThrow());
});

describe('Given a Cadenza JS client instance', () => {
  let iframe: HTMLIFrameElement;
  let cad: CadenzaClient;

  beforeEach(() => {
    iframe = createIframe();
    cad = cadenza(BASE_URL, { iframe });

    // In tests, do not wait for the first embedding target to be shown.
    Object.defineProperty(window, 'location', {
      value: { href: 'test' },
    });
  });

  it('Exposes the base URL as a property', () =>
    expect(cad.baseUrl).toBe(BASE_URL));

  it('Removes a trailing slash from the base URL', () =>
    expect(cadenza(BASE_URL + '/').baseUrl).toBe(BASE_URL));

  it('Exposes the iframe as a property', () => expect(cad.iframe).toBe(iframe));

  it('Resolves the iframe lazily also by ID', () => {
    iframe.id = 'iframe';
    const cad = cadenza(BASE_URL + '/', { iframe: 'iframe' });
    expect(cad.iframe).toBeUndefined();
    document.body.append(iframe);
    expect(cad.iframe).toBe(iframe);
  });

  it('Throws when attempting to show an embedding target without an iframe', () =>
    expect(() => cadenza(BASE_URL).show(EMBEDDING_TARGET_ID)).toThrow(
      'present',
    ));

  it('Throws when attempting to reload the worksheet views without an iframe', () =>
    expect(() => cadenza(BASE_URL).reload()).toThrow('target window'));

  it('Throws when attempting to reload the worksheet views in parent mode without parent window', () =>
    expect(() => cadenza().reload()).toThrow('target window'));

  it('Throws when attempting to send closeMe to iframe', () =>
    expect(() => cadenza({ baseUrl: BASE_URL, iframe }).closeMe()).toThrow(
      'iframe',
    ));

  it('Throws when attempting to show an embedding target in an invisible iframe', () => {
    iframe.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
    expect(() => cad.show(EMBEDDING_TARGET_ID)).toThrow('visible');
  });

  it('Throws when attempting to show an embedding target with an invalid ID', () =>
    expect(() => cad.show('Invalid' as EmbeddingTargetId)).toThrow());

  describe('When showing an embedding target', () => {
    let abortController: AbortController;
    let promise: Promise<void>;

    beforeEach(() => {
      abortController = new AbortController();
      promise = cad.show(EMBEDDING_TARGET_ID, {
        signal: abortController.signal,
      });
    });

    it("Sets the iframe's src accordingly", () =>
      expect(cad.iframe!.src).toBe(`${BASE_URL}/w/${EMBEDDING_TARGET_ID}`));

    it('Includes optional params', () => {
      cadenza(BASE_URL, { iframe }).show(EMBEDDING_TARGET_ID, {
        expandNavigator: true,
        hideMainHeaderAndFooter: true,
        hideWorkbookToolBar: true,
        highlightGlobalId: 'ROOT.MyFolder' as GlobalId,
      });
      expect(cad.iframe!.src).toBe(
        `${BASE_URL}/w/${EMBEDDING_TARGET_ID}?expandNavigator=true&hideMainHeaderAndFooter=true&hideWorkbookToolBar=true&highlightGlobalId=ROOT.MyFolder`,
      );
    });

    describe('When the iframe is loaded and the ready event is received', () => {
      beforeEach(() => {
        cad.iframe!.dispatchEvent(new Event('load'));
        sendEvent('ready');
      });
      it('Resolves the result Promise', () => promise);
    });

    describe('When loading the iframe failed', () => {
      beforeEach(() => cad.iframe!.dispatchEvent(new Event('error')));
      it('Rejects the result Promise with a CadenzaError of type "loading-error"', () =>
        expectCadenzaError(promise, 'loading-error'));
    });

    ['unauthorized', 'not-found', 'internal'].forEach((type) =>
      describe(`When the Cadenza "${type}" page is loaded in the iframe`, () => {
        beforeEach(() => sendEvent('error', { type }));
        it(`Rejects the result Promise with a CadenzaError of type "${type}"`, () =>
          expectCadenzaError(promise, type));
      }),
    );

    describe('When loading the iframe is aborted', () => {
      beforeEach(() => {
        // Without appending the iframe, the contentWindow would not be present.
        document.body.append(iframe);
        cad.iframe!.contentWindow!.stop = jest.fn();

        abortController.abort();
      });

      it('Stops the iframe loading', () =>
        expect(cad.iframe!.contentWindow!.stop).toHaveBeenCalledTimes(1));

      it('Rejects the result Promise with an AbortError', async () => {
        expect.assertions(2);
        try {
          await promise;
        } catch (error: any) {
          expect(error).toBeInstanceOf(DOMException);
          expect(error.name).toBe('AbortError');
        }
      });
    });
  });

  describe('Given a Cadenza JS client instance with different origin', () => {
    let iframe: HTMLIFrameElement;
    let cad: CadenzaClient;

    beforeEach(() => {
      iframe = createIframe();
      cad = cadenza(BASE_URL, { iframe, webApplication: EXTERNAL_LINK_KEY });
    });

    it('Includes given origin param', () => {
      cad.show(EMBEDDING_TARGET_ID);
      expect(cad.iframe!.src).toBe(
        `${BASE_URL}/w/${EMBEDDING_TARGET_ID}?webApplicationLink=${EXTERNAL_LINK_KEY.externalLinkId}&webApplicationLinkRepository=${EXTERNAL_LINK_KEY.repositoryName}`,
      );
    });
  });

  describe('When showing the welcome page', () => {
    beforeEach(() => {
      cad.show(WELCOME_PAGE);
    });

    it("Sets the iframe's src accordingly", () => {
      const expectedSrc = `${BASE_URL}/public/pages/welcome`;
      expect(cad.iframe!.src).toBe(expectedSrc);
    });
  });

  describe('When subscribing to a Cadenza event', () => {
    const EVENT: CadenzaDrillThroughEvent = {
      type: 'drillThrough',
      detail: {
        values: [],
      },
    };

    const subscriber = jest.fn();
    let unsubscribe: () => void;

    beforeEach(() => {
      unsubscribe = cad.on(EVENT.type, subscriber);
    });

    afterEach(() => unsubscribe());

    describe('When the event is sent', () => {
      beforeEach(() => sendEvent(EVENT.type, EVENT.detail));

      it('Calls subscribers of the event', () => {
        expect(subscriber).toHaveBeenCalledTimes(1);
        expect(subscriber).toHaveBeenCalledWith(EVENT);
      });
    });

    describe('When another event is sent', () => {
      beforeEach(() => sendEvent('another'));

      it('Subscribers are not called', () => {
        expect(subscriber).not.toHaveBeenCalled();
      });
    });

    describe('When the event is sent again after unsubscribing', () => {
      beforeEach(() => {
        unsubscribe();
        sendEvent(EVENT.type, EVENT.detail);
      });

      it('Subscribers are not called anymore', () =>
        expect(subscriber).not.toHaveBeenCalled());
    });

    describe('When the event is sent from another origin', () => {
      beforeEach(() => sendEvent(EVENT.type, EVENT.detail, 'http://disy.net'));

      it('Subscribers are not called', () =>
        expect(subscriber).not.toHaveBeenCalled());
    });

    describe('When the event is sent from another iframe', () => {
      beforeEach(() => sendEvent(EVENT.type, EVENT.detail, BASE_URL, window));

      it('Subscribers are not called', () =>
        expect(subscriber).not.toHaveBeenCalled());
    });
  });

  describe('When posting a request to set filters', () => {
    const FILTER = { filter: 'value' };
    let setFilter: jest.SpyInstance;
    let postMessage: jest.Mock<typeof window.postMessage>;

    beforeEach(() => {
      let onmessage: MessagePort['onmessage'];
      window.MessageChannel = jest.fn().mockImplementation(() => ({
        port1: {
          set onmessage(cb: typeof onmessage) {
            onmessage = cb;
          },
        },
        port2: {
          postMessage: (
            data: Parameters<
              InstanceType<typeof MessagePort>['postMessage']
            >[0],
          ) => {
            // @ts-ignore
            onmessage(new MessageEvent('message', { data }));
          },
        },
      }));

      document.body.append(iframe);
      postMessage = cad.iframe!.contentWindow!.postMessage = jest.fn();
      setFilter = jest.spyOn(cad, 'setFilter');
      cad.setFilter(FILTER);
    });

    it('Posts an event with a response port and returns a response Promise', () => {
      expect(postMessage).toHaveBeenCalledTimes(1);
      const [event] = postMessage.mock.lastCall;
      expect(event.type).toBe('setFilter');
      expect(event.detail.filter).toBe(FILTER);
      expect(getPort()).toBeDefined();
      expect(getResponse()).toBeInstanceOf(Promise);
    });

    describe('When a "success" response event is received', () => {
      beforeEach(() => getPort().postMessage({ type: 'setFilter:success' }));

      it('Resolves the response Promise', getResponse);
    });

    describe('When an "error" response event is received', () => {
      beforeEach(() => getPort().postMessage({ type: 'setFilter:error' }));

      it('Rejects the response Promise', () =>
        expect(getResponse()).rejects.toBeUndefined());
    });

    function getPort() {
      return postMessage.mock.lastCall[1].transfer[0] as MessagePort;
    }

    function getResponse() {
      return setFilter.mock.results[0].value as Promise<void>;
    }
  });
});

function sendEvent(
  type: string,
  detail?: unknown,
  origin = BASE_URL,
  source?: MessageEventSource,
) {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin,
      source,
      data: { type, detail },
    }),
  );
}

function createIframe() {
  const iframe = document.createElement('iframe');
  iframe.getBoundingClientRect = () => ({ width: 100, height: 100 }) as DOMRect;
  return iframe;
}

async function expectCadenzaError(promise: Promise<unknown>, type: string) {
  expect.assertions(2);
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(CadenzaError);
    const cadenzaError = error as CadenzaError;
    expect(cadenzaError.type).toBe(type);
  }
}
