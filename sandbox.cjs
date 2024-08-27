const { execSync } = require('child_process');
const { URL } = require('url');

const CADENZA_URL_PARAM = '--cadenza-url';
const DEFAULT_CADENZA_URL = 'http://localhost:8080/cadenza';

const index = process.argv.indexOf(CADENZA_URL_PARAM);
const cadenzaUrlFromArgs = index !== -1
  ? process.argv[index + 1]
  : process.argv.find(arg => arg.startsWith(CADENZA_URL_PARAM + '=')).slice(CADENZA_URL_PARAM.length + 1);
const cadenzaUrl = new URL(cadenzaUrlFromArgs || process.env.CADENZA_URL || DEFAULT_CADENZA_URL);

execSync(`npx --yes http-server -a localhost -c-1 -d false --proxy ${cadenzaUrl.origin} --proxy-options.headers.Origin ${cadenzaUrl.origin} -o /sandbox.html${cadenzaUrl.pathname !== '/' ? `?contextPath=${cadenzaUrl.pathname}` : ''}`, { stdio: 'inherit' });
