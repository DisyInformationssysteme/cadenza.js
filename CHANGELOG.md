# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Changed
- Now logging `CadenzaEvent`s instead of browser `MessageEvent`s.

## 2.1.0 - 2023-11-29
### Added
- Documentation for the `'drillThrough'` event for `CadenzaClient#show` and `CadenzaClient#showMap`

## 2.0.0 - 2023-11-23
### Changed
- Replaced `mediaType` with `dataType` throughout the whole library.

## 1.8.0 - 2023-11-21
### Added
- Common map options for "Show map" in the sandbox

## 1.7.0 - 2023-11-21
### Added
- `filter` option for `CadenzaClient#show` and `CadenzaClient#showMap`

## 1.6.0 - 2023-11-17
### Changed
- The sandbox now uses its own context path as the Cadenza context path by default.

### Fixed
- In the sandbox, the simplified operation mode could not be enabled.

## 1.5.0 - 2023-11-14
### Added
- `labelSet` option for `CadenzaClient#showPage`

### Changed
- Made sandbox CLI more tolerant: The Cadenza URL can now also be passed with a '=' between `--cadenza-url` and the url.

## 1.4.0 - 2023-11-14
### Added
- Documentation for the development sandbox

## 1.3.0 - 2023-11-10
### Added
- `CadenzaClient#expandNavigator`
- `PageSource` parameter to `CadenzaClient#show`
- `expandNavigator` option for `CadenzaClient#show` and `CadenzaClient#showMap`
- `parts` option for `CadenzaClient#fetchData` and `CadenzaClient#downloadData`

### Fixed
- Included missing `sandbox.cjs` in npm package.

## 1.2.0 - 2023-11-08
### Added
- `CadenzaClient#fetchData`
- `CadenzaClient#downloadData`
- `webApplication` constructor option
- `mediaType` option for `CadenzaClient#show`
- `disabledUiFeatures` option for `CadenzaClient#show` and `CadenzaClient#showMap`
- `highlightGlobalId` option for `CadenzaClient#show` and `CadenzaClient#showMap`
- `operationMode` option for `CadenzaClient#show` and `CadenzaClient#showMap`
- Development sandbox (`npm run sandbox`)

## 0.0.1 - 2023-09-07
### Added
- `CadenzaClient#show`
- `CadenzaClient#showMap`
- `CadenzaClient#editGeometry`
- `CadenzaClient#createGeometry`
