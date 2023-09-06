import { cadenza as cadenzaFn } from './cadenza.js';

type CadenzaFn = typeof cadenzaFn;

declare global {
  var cadenza: CadenzaFn & { noConflict: () => CadenzaFn };
}
