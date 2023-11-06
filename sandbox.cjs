const { execSync } = require('child_process');
const { URL } = require('url');

const DEFAULT_CADENZA_URL = 'http://localhost:8080/cadenza';
const cadenzaUrl = new URL((process.argv[2] === '--cadenza-url' && process.argv[3]) || process.env.CADENZA_URL || DEFAULT_CADENZA_URL);

execSync(`npx http-server -a localhost -c-1 -d false --proxy ${cadenzaUrl.origin} --proxy-options.headers.Origin ${cadenzaUrl.origin} -o /sandbox.html${cadenzaUrl.pathname !== '/' ? `?contextPath=${cadenzaUrl.pathname}` : ''}`, { stdio: 'inherit' });
