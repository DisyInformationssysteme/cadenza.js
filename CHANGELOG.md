# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- `CadenzaReloadEvent`

## 2.14.0 - 2024-10-11
### Added
- `setCustomValidity()` and `ValidationMessageType` to control geometry editor validation state

## 2.13.1 - 2024-09-24
### Fixed
- Corrected changelog for 2.13.0

## 2.13.0 - 2024-09-24
### Added
- `CadenzaActionEvent`

## 2.12.0 - 2024-09-23
### Added
- `CadenzaClient#fetchAreaIntersections`
- `CadenzaClient#fetchObjectInfo`

## 2.11.0 - 2024-07-12
### Added
- Support for `dataType=pdf` in `CadenzaClient#downloadData` and `CadenzaClient#fetchData`

### Fixed
- Make Cadenza return an error instead of showing an error page.

## 2.10.0 - 2024-06-11
### Added
- `CadenzaClient#destroy`

### Fixed
- To avoid errors with active subscriptions when the iframe is not visible, a target window (for postMessage communication) is now required only for _sending_ a message (and not for receiving messages).

## 2.9.0 - 2024-06-04
### Added
- Sandbox URL parameter `showUnpublished=true` to show unpublished API. (Makes sense only with a Cadenza that runs in development mode with unpublished API.)

## 2.8.0 - 2024-05-28
### Added
- `invalidateCaches` option for `CadenzaClient#reload`
- Allow communication with parent Cadenza window (Previously, communication was possible only with an embedded Cadenza iframe.)
- `cadenza()` overload with a single options parameter
- `CadenzaClient#closeMe`
- Documentation on listening when a custom application is closed (unload and visibilitychange events)

### Deprecated
- `cadenza()` overload with the `baseUrl` and `options` parameters

## 2.7.0 - 2024-04-17

## 2.6.0 - 2024-04-12
### Added
- `filter` option for `CadenzaClient#createGeometry`, `CadenzaClient#editGeometry` and `CadenzaClient#selectObjects`

## 2.5.0 - 2024-03-26
### Added
- `context` property in `CadenzaDrillThroughEvent`

## 2.4.0 - 2024-03-12
### Added
- `filter` option for `CadenzaClient#downloadData` and `CadenzaClient#fetchData`

## 2.3.2 - 2024-03-05
### Fixed
- Conflict when multiple attributes in objectInfo event details have the same printnames.

## 2.3.1 - 2024-02-28
### Fixed
- Race condition when showing multiple embedding targets at the same time

## 2.3.0 - 2024-02-22
### Added
- `CadenzaClient#selectObjects`
- `CadenzaChangeSelectionEvent`
- `CadenzaObjectInfoEvent`
- Documentation for the "JSON Representation of Cadenza Object Data"
- Sandbox footer with link to docs and devtools hint
- Assertion for iframe being visible when calling one of the `CadenzaClient#show*` methods.

### Changed
- Improved the documentation and types of events.
- Improved the documentation of the `EmbeddingTargetId` and `ExternalLinkKey` types.
- Improved logging

### Removed
- Supposedly unused types: `WorkbookKey`, `WorksheetKey`, `WorkbookViewKey`

### Fixed
- The `FilterVariables` type was missing `string[]`.

## 2.2.1 - 2023-12-12
### Fixed
- In the sandbox, the `fileName` input was not used.

## 2.2.0 - 2023-12-05
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
