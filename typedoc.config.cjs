/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  name: 'Cadenza JS',
  includeVersion: true,
  readme: './src/docs.md',
  entryPoints: ['./src/cadenza.js'],
  out: './apidoc',
  navigationLinks: {
    'Cadenza JS on GitHub': 'https://github.com/DisyInformationssysteme/cadenza.js'
  }
};
