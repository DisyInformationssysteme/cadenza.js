# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses a version scheme based on the Cadenza main version in the format x.x.y, where x.x is the Cadenza main version and y a functional change or bugfix.

## Unreleased
### Added
- `CadenzaClient#setLayerVisibility`
- `CadenzaClient#setFilter`
- `CadenzaClient#setSelection`
- `CadenzaClient#addSelection`
- `CadenzaClient#removeSelection`
- `CadenzaChangeExtentEvent`
- `CadenzaChangeSelectionEvent` is now emitted on `CadenzaClient#createGeometry`, `CadenzaClient#editGeometry`, `CadenzaClient#batchCreateGeometry` and `CadenzaClient#batchEditGeometry`

### Fixed
- `CadenzaClient#showMap` now correctly declares `CadenzaChangeSelectionEvent` as a fired event.

## 10.4.8 - 2025-10-28
### Changed
- **BREAKING CHANGE** `CadenzaEditGeometryDeleteEvent#detail` is now typed as `{ objectIds: any[][] }`.

## 10.4.7 - 2025-10-22
### Added
- `CadenzaEditGeometryCreateEvent`, `CadenzaEditGeometryEditEvent`, `CadenzaEditGeometryDeleteEvent`
- The description of the `additionalLayers` property and the code example have now been expanded to include notes on the correct configuration of Cadenza.

## 10.4.6 - 2025-10-20
### Fixed
- The "Go!" button in the sandbox page is now disabled during the execution of the selected action.

## 10.4.5 - 2025-09-12
### Added
- `isAutoCorrection` and `includeGeometryValidationReport` options for `CadenzaClient#fetchAreaIntersections`
- Possibility to enable/disable debug logging at runtime.

### Changed
- **BREAKING CHANGE** Return value of `CadenzaClient#fetchAreaIntersections` is now from type `AreaIntersectionsResult` or `ProblemDetail`

### Removed
- Unused `CadenzaObjectInfoEvent`, which is also redundant with the `CadenzaChangeSelectionEvent`

### Fixed
- The examples for `setSelection`, `addSelection` and `removeSelection` have been corrected in the sandbox with regard to the handling of an empty `extentStrategy` input field.

## 10.4.4 - 2025-08-07
### Added
- Constructor option `skipGuest`

## 10.4.3 - 2025-07-24
### Added
- Documentation for `CadenzaClient#batchEditGeometry` and `CadenzaClient#batchCreateGeometry`

### Changed
- `CadenzaEditGeometryOkEvent#detail` is now typed as `FeatureCollection | Feature`.

## 10.4.2 - 2025-07-10
### Added
- `width`, `height` and `withScale` options for `CadenzaClient#getData`
- `layout` option for `CadenzaClient#show`
- `CadenzaClient#batchEditGeometry`
- `CadenzaClient#batchCreateGeometry`

### Changed
- Extracted `CommonGeometryEditOptions` for reuse.

### Removed
- **BREAKING CHANGE** The deprecated parameters `locationFinder` and `mapExtent` have been removed from the options of the methods `showMap`, `createGeometry`, `editGeometry`, `selectObjects`.

## 10.4.0 - 2025-06-24

## 10.3.6 - 2025-05-28

## 10.3.5 - 2025-05-21
### Added
- Support for setting spatial filters define on an embedded target

## 10.3.4 - 2025-05-16
### Added
- Log message to the console when starting to listen on the 'ready' event of Cadenza

## 10.3.3 - 2025-05-05
### Removed
- `UIFeature` value `geometry-edit-translate`

## 10.3.2 - 2025-04-30
### Added
- `UIFeature` value `geometry-edit-translate`

## 10.3.1 - 2025-04-04
### Added
- `snapping` option for `CadenzaClient#createGeometry` and `CadenzaClient#editGeometry`

## 10.3.0 - 2025-03-18

## 10.2.9 - 2025-02-20
### Added
- `extentStrategy` option for the internal methods `CadenzaClient#setSelection`, `CadenzaClient#addSelection`, `CadenzaClient#removeSelection`
- `version` property on the `cadenza()` function, which exposes the Cadenza JS version at runtime.

### Changed
- The `reload` command returns a Promise which resolves when all views which can be reloaded have finished reloading.

## 10.2.8 - 2024-11-27
### Changed
- The required field indicator '*' of the 'geometry' parameter in the 'Show Map' example in the sandbox has been removed

## 10.2.7 - 2024-11-26
### Changed
- Examples in the sandbox are now displayed more compactly

### Fixed
- Removed duplicate geometry section in `sandbox.html#editGeometry`

## 10.2.6 - 2024-11-25
### Fixed
- `geometry` parameter now applies again as `GeometryExtentStrategy`

## 10.2.5 - 2024-11-25
### Added
- 'Additional Layers' to the sandbox of 'Edit Geometry'

## 10.2.4 - 2024-11-25
### Added
- `additionalLayers` option for `CadenzaClient#showMap`
- `LayerDataExtentStrategy`, `LocationFinderExtentStrategy` and `StaticExtentStrategy`
- "Extent Strategy" also to the sandbox
- Improved sandbox 'additionalLayers' and 'geometry' examples

### Changed
- **BREAKING CHANGE** Renamed `zoomTarget` parameter, `ZoomTarget` type and `GeometryZoomTarget` type to `extentStrategy`, `ExtentStrategy` and `GeometryExtentStrategy`

### Deprecated
- The optional zooming parameters `locationFinder` and `mapExtent` in `CadenzaClient#showMap`, `CadenzaClient#createGeometry` and `CadenzaClient#editGeometry`

## 10.2.3 - 2024-11-08
### Added
- `Feature#type` property.
- `Feature#circumference` property.
- `FeatureCollection#type` property
- `Geometry#coordinates` property
- Documentation for how to show, fetch and download embedding targets of type report as PDF (via the existing dataType=pdf option).

### Changed
- **BREAKING CHANGE** `CadenzaEditGeometryUpdateEvent#detail` is now typed as `FeatureCollection | Feature | undefined`. (Before: `{ geometry: Geometry }`)
- `CadenzaEditGeometryOkEvent#detail` is now typed as `Feature` to align it with the rest of the API. (Before: `{ geometry: Geometry }`)

## 10.2.2 - 2024-10-24
### Added
- `CadenzaReloadEvent`
- `additionalLayers` option for `CadenzaClient#createGeometry` and `CadenzaClient#editGeometry`
- `disabledUiFeatures` option for `CadenzaClient#createGeometry` and `CadenzaClient#editGeometry`
- Support for 'workbook-map-add-layer' as `disabledUiFeatures` value

## 10.2.1 - 2024-10-14
### Added
- `setCustomValidity()` and `ValidationMessageType` to control geometry editor validation state

## 10.2.0 - 2024-10-11
### Added
- `operationMode` option for `CadenzaClient#createGeometry`, `CadenzaClient#editGeometry` and `CadenzaClient#selectObjects`

### Changed
- Base the version scheme on the Cadenza main version (starting with Cadenza 10.2). New versions have the format x.x.y, where x.x is the Cadenza main version and y a functional change or bugfix.

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
