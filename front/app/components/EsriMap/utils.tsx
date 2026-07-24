import Basemap from '@arcgis/core/Basemap';
import Collection from '@arcgis/core/core/Collection';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import { substitute } from '@arcgis/core/intl';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Layer from '@arcgis/core/layers/Layer';
import FeatureReductionCluster from '@arcgis/core/layers/support/FeatureReductionCluster';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import CustomContent from '@arcgis/core/popup/content/CustomContent';
import TextContent from '@arcgis/core/popup/content/TextContent';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import { createRenderer } from '@arcgis/core/smartMapping/renderers/heatmap.js';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import { v4 as uuidv4 } from 'uuid';

import { IMapConfig } from 'api/map_config/types';
import { IMapLayerAttributes } from 'api/map_layers/types';

import { Localize } from 'hooks/useLocalize';

import { hexToRGBA } from 'utils/helperUtils';
import { projectPointToWebMercator } from 'utils/mapUtils/map';

import {
  BASEMAP_AT_ATTRIBUTION,
  DEFAULT_TILE_PROVIDER,
  MAPTILER_ATTRIBUTION,
  MAP_LEGEND_EXPAND_ID,
} from './constants';
import { DefaultBasemapType } from './types';

// getBasemapType
// Description: Gets the basemap type given a certain tileProvider URL.
export const getDefaultBasemapType = (
  tileProvider: string | undefined
): DefaultBasemapType => {
  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return 'BasemapAt';
  }

  return 'MapTiler';
};

// getDefaultBasemap
// Description: Gets the correct basemap given a certain tileProvider URL.
export const getDefaultBasemap = (tileProvider: string | undefined): Layer => {
  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return new VectorTileLayer({
      // For Vienna's custom basemap, we fetch a vector tile layer
      // NOTE: Currently only Vienna requires this. If we ever need to add this for other clients, we
      // should move this into a separate configuration somewhere.
      portalItem: {
        id: 'd607c5c98e6a4e1fbd3569e38c5c8a0c',
      },
    });
  }
  const webTileLayer = new WebTileLayer({
    urlTemplate: tileProvider || DEFAULT_TILE_PROVIDER,
    copyright: getTileAttribution(tileProvider || ''),
  });

  if (tileProvider?.includes('maptiler')) {
    webTileLayer.set('tileInfo.size', 512);
    webTileLayer.set(
      'tileInfo.lods',
      webTileLayer.tileInfo.lods.map((lod) => {
        lod.resolution = lod.resolution / 2;
        lod.scale = lod.scale / 2;
        return lod;
      })
    );
  }

  return webTileLayer;
};

// getTileAttribution
// Description: Gets the correct tile attribution given a certain tileProvider URL.
const getTileAttribution = (tileProvider: string): string => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (tileProvider?.includes('maptiler')) {
    return MAPTILER_ATTRIBUTION;
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return BASEMAP_AT_ATTRIBUTION;
  }

  return MAPTILER_ATTRIBUTION; // MapTiler Basic is the default map
};

// getMapPinSymbol
// Description: Get a map pin symbol (with an optional color value)
type MapPinSymbolProps = {
  color?: string;
  sizeInPx?: number;
};
export const getMapPinSymbol = ({ color, sizeInPx }: MapPinSymbolProps) => {
  return new SimpleMarkerSymbol({
    color,
    outline: {
      color: colors.white,
    },
    size: sizeInPx ? `${sizeInPx}px` : '38px',
    xoffset: 0,
    yoffset: 15,
    path: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
  });
};

export const getEsriMakiSymbol = (iconName: MakiIconName, color: string) => {
  return fetch(
    // Fetch the SVG from the maki icons endpoint
    `https://unpkg.com/@icon/maki-icons/icons/${
      iconName === 'toilets' ? 'toilet' : iconName.toLowerCase() // Specific handling for a backwards compatibility issue
    }.svg`
  )
    .then((response) => response.text())
    .then((svg) => {
      // Extract the SVG path value
      const path = svg.match(/d="([^"]*)"/)?.[1];

      // Create and return Esri symbol using the path value
      return new SimpleMarkerSymbol({
        color,
        outline: {
          width: 0,
        },
        size: '28px',
        xoffset: 0,
        yoffset: 0,
        path,
      });
    });
};

type MakiIconName =
  | 'aerialway'
  | 'airfield'
  | 'airport'
  | 'alcohol-shop'
  | 'america-football'
  | 'amusement-park'
  | 'aquarium'
  | 'art-gallery'
  | 'attraction'
  | 'bakery'
  | 'bank'
  | 'bar'
  | 'baseball'
  | 'basketball'
  | 'beer'
  | 'bicycle'
  | 'bicycle-share'
  | 'building'
  | 'bus'
  | 'cafe'
  | 'campsite'
  | 'car'
  | 'cemetery'
  | 'cinema'
  | 'circle'
  | 'circle-stroked'
  | 'clothing-store'
  | 'college'
  | 'commercial'
  | 'cricket'
  | 'cross'
  | 'dam'
  | 'danger'
  | 'dentist'
  | 'doctor'
  | 'dog-park'
  | 'drinking-water'
  | 'embassy'
  | 'entrance'
  | 'fast-food'
  | 'ferry'
  | 'fire-station'
  | 'fuel'
  | 'garden'
  | 'gift'
  | 'golf'
  | 'grocery'
  | 'hairdresser'
  | 'harbor'
  | 'heart'
  | 'heliport'
  | 'hospital'
  | 'ice-cream'
  | 'industry'
  | 'information'
  | 'laundry'
  | 'library'
  | 'lighthouse'
  | 'lodging'
  | 'marker'
  | 'monument'
  | 'mountain'
  | 'museum'
  | 'music'
  | 'park'
  | 'parking'
  | 'parking-garage'
  | 'pharmacy'
  | 'picnic-site'
  | 'pitch'
  | 'place-of-worship'
  | 'playground'
  | 'police'
  | 'post'
  | 'prison'
  | 'rail'
  | 'rail-light'
  | 'rail-metro'
  | 'ranger-station'
  | 'religious-christian'
  | 'religious-jewish'
  | 'religious-muslim'
  | 'restaurant'
  | 'roadblock'
  | 'rocket'
  | 'school'
  | 'shelter'
  | 'shop'
  | 'skiing'
  | 'soccer'
  | 'square'
  | 'square-stroke'
  | 'stadium'
  | 'star'
  | 'star-stroke'
  | 'suitcase'
  | 'sushi'
  | 'swimming'
  | 'telephone'
  | 'tennis'
  | 'theatre'
  | 'toilets'
  | 'town-hall'
  | 'triangle'
  | 'triangle-stroked'
  | 'veterinary'
  | 'volcano'
  | 'warehouse'
  | 'waste-basket'
  | 'water'
  | 'wetland'
  | 'zoo';

// getShapeSymbol
// Description: Get a simple shape symbol (with an optional outline width & color value)
type SimpleShape = 'circle' | 'square' | 'cross' | 'diamond' | 'triangle' | 'x';
type SimpleShapeProps = {
  shape: SimpleShape;
  color?: string;
  outlineColor?: string;
  outlineWidth?: number;
  sizeInPx?: number;
};

export const getShapeSymbol = ({
  shape,
  color,
  outlineColor,
  outlineWidth,
  sizeInPx,
}: SimpleShapeProps) => {
  return new SimpleMarkerSymbol({
    style: shape,
    color: color || colors.white,
    size: sizeInPx,
    outline: {
      color: outlineColor || hexToRGBA(colors.white, 0.2),
      width: outlineWidth || 1,
    },
  });
};

// getLineSymbol
// Description: Get a simple line symbol
type LineSymbolProps = {
  color?: string;
  style?: EsriLineStyle;
};

export type EsriLineStyle =
  | 'dash'
  | 'dash-dot'
  | 'dot'
  | 'long-dash'
  | 'long-dash-dot'
  | 'long-dash-dot-dot'
  | 'none'
  | 'short-dash'
  | 'short-dash-dot'
  | 'short-dash-dot-dot'
  | 'short-dot'
  | 'solid';

export const getLineSymbol = ({ style, color }: LineSymbolProps) => {
  return new SimpleLineSymbol({
    color: color || colors.black,
    width: 2,
    style: style || 'solid',
  });
};

// getFillSymbol
// Description: Get a fill symbol
type FillSymbolProps = {
  color?: string;
  transparency?: number;
  outlineStyle?: EsriLineStyle;
  outlineColor?: string;
};

export const getFillSymbol = ({
  transparency,
  color,
  outlineStyle,
  outlineColor,
}: FillSymbolProps) => {
  return new SimpleFillSymbol({
    color: transparentize(transparency || 1.0, color || colors.coolGrey700),
    style: 'diagonal-cross',
    outline: {
      color: outlineColor || [0, 0, 0, 0.8],
      width: 2,
      style: outlineStyle || 'dash',
    },
  });
};

// newPointGraphic
// Description: Creates a new point (pin symbol) graphic
export const newPinPointGraphic = (point: GeoJSON.Point, color: string) => {
  return new Graphic({
    geometry: new Point({
      longitude: point.coordinates[0],
      latitude: point.coordinates[1],
    }),
    symbol: getMapPinSymbol({
      color,
      sizeInPx: 44,
    }),
  });
};

// addPointGraphicToMap
// Description: Adds a point graphic to the map
export const addPointGraphicToMap = (
  point: GeoJSON.Point,
  mapView: MapView | null | undefined,
  graphic: Graphic
) => {
  if (mapView) {
    mapView.graphics.removeAll();
    mapView.graphics.add(graphic);
    goToMapLocation(point, mapView);
  }
};

// resetCursor
// Description: Restore the default cursor. Call this when a map that used one
// of the hover helpers below goes away — they set the cursor on document.body,
// so without this it stays a pointer for the rest of the session.
export const resetCursor = () => {
  document.body.style.cursor = 'auto';
};

// changeCursorOnHoverWhen
// Description: On map hover, show a pointer cursor when the hit result matches
// isClickable. The hitTest is async, so the view can be torn down before it
// resolves — bail in that case rather than leaving a stale pointer behind.
const changeCursorOnHoverWhen = (
  event: any,
  mapView: MapView,
  isClickable: (result: __esri.HitTestResult) => boolean
) => {
  mapView.hitTest(event).then((result) => {
    if (mapView.destroyed) return;
    document.body.style.cursor = isClickable(result) ? 'pointer' : 'auto';
  });
};

// changeCursorOnHover
// Description: On map hover, change the cursor to pointer if hovering over a graphic
export const changeCursorOnHover = (event: any, mapView: MapView) => {
  changeCursorOnHoverWhen(event, mapView, (result) =>
    result.results.some((r) => r.type === 'graphic')
  );
};

// goToMapLocation
// Description: Center a specific location on the map
export const goToMapLocation = async (
  coordinates: GeoJSON.Point,
  mapView?: MapView,
  zoomLevel?: number
) => {
  mapView
    ?.goTo(
      {
        center: [coordinates.coordinates[0], coordinates.coordinates[1]],
        zoom: zoomLevel || mapView.zoom,
      },
      {
        duration: 1000,
      }
    )
    .catch(() => {
      // Do nothing
    });
};

// esriPointToGeoJson
// Description: Converts an Esri point to an GeoJSON.Point
export const esriPointToGeoJson = (esriPoint: Point): GeoJSON.Point => {
  // Project the point to Web Mercator, in case the map is using a different projection
  const projectedPoint = projectPointToWebMercator(esriPoint);

  return {
    type: 'Point',
    coordinates: [projectedPoint.longitude || 0, projectedPoint.latitude || 0],
  };
};

// getClusterConfiguration
// Description: Gets the configuration needed to render a FeatureLayer with clustering on zoom in/out
export const getClusterConfiguration = (clusterSymbolColor?: string) => {
  return new FeatureReductionCluster({
    maxScale: 600, // Stop clustering once fully zoomed in
    clusterMinSize: '20',
    symbol: getShapeSymbol({
      shape: 'circle',
      color: clusterSymbolColor || colors.coolGrey700,
      outlineColor: colors.white,
      outlineWidth: 3,
      sizeInPx: 20,
    }),
    labelingInfo: [
      // Cluster configuration from Esri sample
      // src: https://developers.arcgis.com/javascript/latest/sample-code/featurereduction-cluster-filter/
      {
        deconflictionStrategy: 'none',
        labelExpressionInfo: {
          expression:
            '\n  $feature["cluster_count"];\n  var value = $feature["cluster_count"];\n  var num = Count(Text(Round(value)));\n  var label = When(\n    num < 4, Text(value, "#.#"),\n    num == 4, Text(value / Pow(10, 3), "#.0k"),\n    num <= 6, Text(value / Pow(10, 3), "#k"),\n    num == 7, Text(value / Pow(10, 6), "#.0m"),\n    num > 7, Text(value / Pow(10, 6), "#m"),\n    Text(value, "#,###")\n  );\n  return label;\n  ',
        },
        labelPlacement: 'center-center',
        labelPosition: 'curved',
        repeatLabel: true,
        symbol: {
          type: 'text',
          color: colors.white,
          font: {
            family: 'Noto Sans',
            size: 10,
            weight: 'bold',
          },
          horizontalAlignment: 'center',
          kerning: true,
          rotated: false,
          text: '',
          verticalAlignment: 'baseline',
          xoffset: 0,
          yoffset: 0,
          angle: 0,
          lineWidth: 192,
          lineHeight: 1,
        },
      },
    ],
  });
};

// showAddInputPopup
// Description: Shows a popup where the user clicked and adds content from a popupContentNode
// Usage: This is used by the Idea Map to show "Submit" buttons on map click.
type AddInputPopupProps = {
  event;
  mapView: MapView;
  setSelectedInput: (idea: string | null) => void;
  popupTitle: string;
  popupContentNode: HTMLDivElement;
};

export const showAddInputPopup = ({
  event,
  mapView,
  setSelectedInput,
  popupContentNode,
  popupTitle,
}: AddInputPopupProps) => {
  // Project the point to Web Mercator to guarantee the correct coordinate system
  const clickedPointProjected = projectPointToWebMercator(event.mapPoint);

  // Close any open UI elements
  setSelectedInput(null);
  // This popup is small, so keep it anchored to the clicked location even if
  // a previously opened (feature) popup enabled docking on this view
  if (mapView.popup) {
    mapView.popup.dockEnabled = false;
  }
  // Pan to the clicked location, then open popup.
  // Using mapView.openPopup() directly — avoid creating new Popup()
  // as the Popup widget class is deprecated and broken in ArcGIS SDK 4.34+.
  mapView
    .goTo({ center: clickedPointProjected }, { duration: 500 })
    .then(() => {
      mapView.openPopup({
        title: popupTitle,
        content: popupContentNode,
        location: clickedPointProjected,
      });
    })
    .catch(() => {
      // goTo can be interrupted by user interaction — still open popup
      mapView.openPopup({
        title: popupTitle,
        content: popupContentNode,
        location: clickedPointProjected,
      });
    });
};

// getEsriFeaturePopupFeatures
// Description: From a hitTest result, collect web map features that have popups
// configured (and enabled) in ArcGIS. Platform graphics (idea pins, cluster
// aggregates) and layers we create in-platform are excluded.
const getEsriFeaturePopupFeatures = (
  hitTestResult: __esri.HitTestResult
): Graphic[] => {
  const features: Graphic[] = [];

  hitTestResult.results.forEach((hit) => {
    if (hit.type !== 'graphic') return;
    const { graphic, layer } = hit;

    // Exclude platform graphics (idea pins and cluster aggregates)
    if (
      graphic.attributes?.ideaId ||
      graphic.attributes?.cluster_count !== undefined
    ) {
      return;
    }

    // Exclude view graphics (no layer) and layers we inject into a Web Map
    // ourselves (suffixed with '_internal' in EsriMap/index.tsx)
    if (!layer || layer.id.includes('_internal')) return;

    // Respect the popup configuration from ArcGIS: the layer must have popups
    // enabled and the feature must resolve to a popup template. Layers created
    // in-platform (GeoJSON / feature layers from a URL) never get a template,
    // so they are naturally excluded.
    if ((layer as __esri.FeatureLayer).popupEnabled === false) return;

    const popupTemplate: PopupTemplate | null | undefined =
      graphic.getEffectivePopupTemplate();
    if (!popupTemplate) return;

    features.push(graphic);
  });

  return features;
};

// Popup titles are authored in ArcGIS and can be arbitrarily long. A long title
// dominates the popup header and pushes the content out of view, so titles over
// this length are truncated in the header and shown in full in the popup body.
const MAX_POPUP_TITLE_LENGTH = 45;

// truncateTitle
// Description: Shorten a title to MAX_POPUP_TITLE_LENGTH, cutting on a word
// boundary unless that would leave less than half the allowed length.
const truncateTitle = (title: string) => {
  const clipped = title.slice(0, MAX_POPUP_TITLE_LENGTH).trimEnd();
  const lastSpace = clipped.lastIndexOf(' ');
  const cutoff =
    lastSpace > MAX_POPUP_TITLE_LENGTH / 2 ? lastSpace : clipped.length;
  return `${clipped.slice(0, cutoff).trimEnd()}…`;
};

// resolveFeatureTitle
// Description: Resolve a popup template's title for a given feature, filling in
// its {FIELD} placeholders. Returns null whenever we can't reproduce exactly
// what Esri will render in the header — we replace the header with this string,
// so anything less than an exact match would make the title worse, not shorter.
const resolveFeatureTitle = (
  template: PopupTemplate,
  feature: Graphic
): string | null => {
  const { title } = template;
  // Titles built in code, not from a string template
  if (typeof title !== 'string') return null;
  // A character-count cut could slice through an HTML tag
  if (title.includes('<')) return null;

  // The graphic Esri gives us from a hitTest only carries the fields the layer
  // has client-side; Esri fetches the template's outFields when it actually
  // opens the popup. So a field referenced by the title may be missing here.
  const attributes: Record<string, unknown> = feature.attributes ?? {};
  const keysByLowerName = new Map(
    Object.keys(attributes).map((key) => [key.toLowerCase(), key])
  );

  for (const [, placeholder] of title.matchAll(/\{([^}]*)\}/g)) {
    // Arcade expressions and relationships ({expression/expr0}), and explicit
    // format directives ({COST:NumberFormat(...)}), only Esri can evaluate
    if (placeholder.includes('/') || placeholder.includes(':')) return null;

    const key = keysByLowerName.get(placeholder.trim().toLowerCase());
    const value = key === undefined ? undefined : attributes[key];
    // Absent from the hitTest attributes, or a value Esri formats when it
    // renders (dates, numbers) in ways substitute() does not reproduce. Only
    // plain strings come out of substitute() byte-identical to Esri's header.
    if (typeof value !== 'string') return null;
  }

  return substitute(title, attributes) || null;
};

// createFullTitleNode
// Description: The popup body copy of a truncated title. Kept at the same small
// size as the popup's attribute table text, so it reads as supporting detail
// rather than a second heading.
const createFullTitleNode = (title: string) => {
  const node = document.createElement('div');
  node.textContent = title;
  node.style.fontSize = '12px';
  node.style.fontWeight = '600';
  node.style.lineHeight = '1.4';
  node.style.wordBreak = 'break-word';
  return node;
};

// The popup template each feature had before we enriched it. Keyed weakly, so
// entries go away with the graphics themselves.
const originalPopupTemplates = new WeakMap<Graphic, PopupTemplate>();

// One popup open at a time; replaced on each open (see showEsriFeaturePopup).
let ctaFeatureWatchHandle: IHandle | null = null;

// buildFeaturePopupTemplate
// Description: Returns a copy of a feature's ArcGIS popup template with:
//  - a DOM node (e.g. the "Submit an idea" button) prepended above the
//    template's configured content, when one is passed
//  - a long title truncated in the header, with the full title added to the body
//    below the prepended node (or at the very top when there is no prepended node)
const buildFeaturePopupTemplate = (
  template: PopupTemplate,
  feature: Graphic,
  prependNode?: HTMLDivElement
): PopupTemplate => {
  const resolvedTitle = resolveFeatureTitle(template, feature);
  const hasLongTitle =
    !!resolvedTitle && resolvedTitle.length > MAX_POPUP_TITLE_LENGTH;

  // Nothing to add — show the template as ArcGIS configured it
  if (!prependNode && !hasLongTitle) return template;

  const enriched = template.clone();
  const content = enriched.content;

  const addedContent: __esri.Content[] = [];
  if (prependNode) {
    addedContent.push(new CustomContent({ creator: () => prependNode }));
  }
  if (resolvedTitle && hasLongTitle) {
    enriched.title = truncateTitle(resolvedTitle);
    const fullTitleNode = createFullTitleNode(resolvedTitle);
    addedContent.push(new CustomContent({ creator: () => fullTitleNode }));
  }

  if (typeof content === 'string') {
    enriched.content = [...addedContent, new TextContent({ text: content })];
  } else if (Array.isArray(content)) {
    enriched.content = [...addedContent, ...content];
  } else if (!content) {
    enriched.content = addedContent;
  } else {
    // Function-based content (only possible on templates authored in code)
    // can't be extended — show the template unchanged
    return template;
  }

  return enriched;
};

// showEsriFeaturePopup
// Description: Opens the popup that was configured in ArcGIS for the web map
// feature(s) at the clicked location. Returns whether a popup was opened, so
// callers can fall back to their own click behaviour when no feature was hit.
// Usage: Used by read-only maps and the Idea Map to let users explore web map features.
type ShowEsriFeaturePopupProps = {
  event;
  mapView: MapView;
  // Pass a hitTest result if the caller already performed one for this event
  hitTestResult?: __esri.HitTestResult;
  // Optional extra content (e.g. a "Submit an idea" button) shown above
  // each feature's configured popup content
  prependContentNode?: HTMLDivElement;
};

export const showEsriFeaturePopup = async ({
  event,
  mapView,
  hitTestResult,
  prependContentNode,
}: ShowEsriFeaturePopupProps): Promise<boolean> => {
  const result = hitTestResult ?? (await mapView.hitTest(event));
  const features = getEsriFeaturePopupFeatures(result);

  if (features.length === 0) {
    return false;
  }

  // The CTA is a single DOM node, so it can't sit on every page of a stacked
  // popup at once. Each feature gets its own placeholder; the watcher below
  // moves the CTA into whichever feature is currently paged to.
  const ctaPlaceholders = new Map<Graphic, HTMLDivElement>();

  features.forEach((feature) => {
    // Always enrich the template the feature started with. Esri hands back the
    // same Graphic instance across hitTests for some layer types, so reading
    // back the template we assigned on a previous click would stack a second
    // CTA onto it and re-truncate the already-truncated title.
    const template =
      originalPopupTemplates.get(feature) ??
      feature.getEffectivePopupTemplate();
    if (!template) return;
    originalPopupTemplates.set(feature, template);

    let placeholder: HTMLDivElement | undefined;
    if (prependContentNode) {
      placeholder = document.createElement('div');
      ctaPlaceholders.set(feature, placeholder);
    }

    feature.popupTemplate = buildFeaturePopupTemplate(
      template,
      feature,
      placeholder
    );
  });

  // Re-parent the CTA into the paged-to feature. `initial: true` covers the
  // first feature once the popup opens.
  if (prependContentNode && ctaPlaceholders.size > 0) {
    ctaFeatureWatchHandle?.remove();
    ctaFeatureWatchHandle = reactiveUtils.watch(
      () => mapView.popup?.selectedFeature,
      (selectedFeature) => {
        const placeholder =
          selectedFeature && ctaPlaceholders.get(selectedFeature);
        if (placeholder && prependContentNode.parentNode !== placeholder) {
          placeholder.appendChild(prependContentNode);
        }
      },
      { initial: true }
    );
  }

  // Project the point to Web Mercator to guarantee the correct coordinate system
  const clickedPointProjected = projectPointToWebMercator(event.mapPoint);

  // On small views (e.g. the 420px-tall survey question maps) an anchored
  // popup can overflow the view and clip its content. Dock it to a corner
  // instead, so it stays fully within the view and scrolls internally.
  const isSmallView = mapView.height < 544 || mapView.width < 544;
  if (mapView.popup) {
    mapView.popup.dockEnabled = isSmallView;
    mapView.popup.dockOptions = {
      breakpoint: false,
      buttonEnabled: false,
      position: 'bottom-right',
    };
  }

  // The docked popup shares the bottom-right corner with the legend, which
  // opens expanded by default on some maps — collapse it so it doesn't
  // overlap the popup.
  if (isSmallView) {
    const legend = mapView.ui.find(MAP_LEGEND_EXPAND_ID) as
      | __esri.Expand // Esri types ui.find as returning a plain widget
      | undefined;
    if (legend?.expanded) {
      legend.collapse();
    }
  }

  const openPopup = () => {
    // Using mapView.openPopup() directly — avoid creating new Popup()
    // as the Popup widget class is deprecated and broken in ArcGIS SDK 4.34+.
    mapView.openPopup({
      features,
      location: clickedPointProjected,
    });
  };

  // Pan to the clicked location, then open popup (like showAddInputPopup).
  mapView
    .goTo({ center: clickedPointProjected }, { duration: 500 })
    .then(openPopup)
    .catch(() => {
      // goTo can be interrupted by user interaction — still open popup
      openPopup();
    });

  return true;
};

// changeCursorOnFeaturePopupHover
// Description: On map hover, show a pointer cursor when hovering a web map
// feature that would open a popup on click
export const changeCursorOnFeaturePopupHover = (
  event: any,
  mapView: MapView
) => {
  changeCursorOnHoverWhen(
    event,
    mapView,
    (result) => getEsriFeaturePopupFeatures(result).length > 0
  );
};

// pinUiElementToTop
// Description: Adds a custom UI element to the top of the 'top-right' controls
// stack and keeps it pinned there. Esri only honors the `index` at insert time,
// so when other widgets (zoom, fullscreen, web map defaults) finish loading on a
// later tick, the element can otherwise end up beneath or between them depending
// on load timing. Re-asserting on every change to the stack keeps it on top.
// Returns a cleanup function that removes the element and stops observing.
export const pinUiElementToTop = (
  mapView: MapView,
  element: HTMLElement,
  position: 'top-right' = 'top-right'
) => {
  mapView.ui.add(element, { position, index: 0 });
  mapView.ui.move(element, { position, index: 0 });

  // Esri exposes no reactive property for the components at a position
  // (DefaultUI.components only lists the *default* widgets, and is not updated
  // when one is added via ui.add), so observe the corner's DOM instead: any
  // widget that loads in later and appends itself here re-triggers the pin.
  const corner = mapView.ui.container?.querySelector(`.esri-ui-${position}`);
  const observer = new MutationObserver(() => {
    // Already at the top — skip, so our own move() doesn't retrigger us
    if (corner?.firstElementChild === element) return;
    mapView.ui.move(element, { position, index: 0 });
  });
  if (corner) {
    observer.observe(corner, { childList: true });
  }

  return () => {
    observer.disconnect();
    // The view may already have been destroyed by the EsriMap that owns it
    if (!mapView.destroyed) {
      mapView.ui.remove(element);
    }
  };
};

// createEsriFeatureLayers
// Description: Create list of Esri Feature layers from a list of IMapLayerAttributes
export const createEsriFeatureLayers = (
  layers: IMapLayerAttributes[],
  localize: Localize
) => {
  // create new Feature Layers from the Map Config layers
  const esriLayers: Layer[] = [];
  layers.forEach((layer) => {
    if (localize(layer.title_multiloc)) {
      const title = localize(layer.title_multiloc);

      // Extract number of sublayers if present
      const titleSplit = title.lastIndexOf('(');
      const subLayerCount =
        titleSplit >= 0
          ? parseInt(title.substring(titleSplit + 1, title.length - 1), 10)
          : 0;

      // If we have sublayers, add a feature layer for each
      if (subLayerCount > 1) {
        for (let i = 0; i < subLayerCount; i++) {
          esriLayers.push(
            new FeatureLayer({
              url: `${layer.layer_url}/${i + 1}`,
            })
          );
        }
      } else {
        // Otherwise, just add the single feature layer
        esriLayers.push(
          new FeatureLayer({
            url: layer.layer_url,
          })
        );
      }
    }
  });
  return esriLayers;
};

// parseLayers
// Description: Parse the layers from the map config and create Esri layers
export const parseLayers = (
  mapConfig: IMapConfig | null | undefined,
  localize: Localize
) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const mapConfigLayers = mapConfig?.data?.attributes.layers;
  if (!mapConfigLayers) return [];

  // All layers are either of type Esri or GeoJSON, so we can check just the first layer
  if (mapConfigLayers[0]?.type === 'CustomMaps::GeojsonLayer') {
    return createEsriGeoJsonLayers(mapConfigLayers, localize);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (mapConfigLayers[0]?.type === 'CustomMaps::EsriFeatureLayer') {
    return createEsriFeatureLayers(mapConfigLayers, localize);
  }
  return [];
};

// createEsriGeoJsonLayers
// Description: Create list of Esri GeoJSON layers from a list of IMapLayerAttributes
export const createEsriGeoJsonLayers = (
  layers: IMapLayerAttributes[],
  localize: Localize
) => {
  return layers.map((layer) => {
    // create a new blob from geojson featurecollection
    const blob = new Blob([JSON.stringify(layer.geojson)], {
      type: 'application/json',
    });

    // URL reference to the blob
    const url = URL.createObjectURL(blob);

    // create new geojson layer using the created url
    const geoJsonLayer = new GeoJSONLayer({
      id: `${uuidv4()}`,
      url,
      customParameters: {
        layerId: layer.id,
      },
    });

    // All features in a layer will have the same geometry, so we can just check the first feature
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const geometryType = layer.geojson?.features?.[0]?.geometry?.type;

    if (geometryType === 'Polygon') {
      // All features in a layer will have the same symbology, so we can just check the first feature
      const fillColour = layer.geojson?.features[0]?.properties?.fill;
      geoJsonLayer.renderer = new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: fillColour
            ? hexToRGBA(fillColour, 0.3)
            : hexToRGBA(colors.coolGrey600, 0.3),
          outline: {
            color: fillColour,
            width: 2,
          },
        }),
      });
    } else if (geometryType === 'LineString') {
      const lineColor = layer.geojson?.features[0]?.properties?.stroke;
      geoJsonLayer.renderer = new SimpleRenderer({
        symbol: new SimpleLineSymbol({
          color: lineColor ?? colors.coolGrey600,
          width: 2,
        }),
      });
    } else if (geometryType === 'Point') {
      // Get color and icon name
      const pointColour =
        layer.geojson?.features[0]?.properties?.fill ||
        layer.geojson?.features[0]?.properties?.['marker-color'] ||
        colors.grey700;
      const pointSymbol =
        layer.geojson?.features[0]?.properties?.['marker-symbol'];

      // Generate the symbol
      if (pointSymbol) {
        // Use a custom Maki symbol
        getEsriMakiSymbol(pointSymbol, pointColour).then((symbol) => {
          geoJsonLayer.renderer = new SimpleRenderer({
            symbol,
          });
        });
      } else {
        // Use the default map pin symbol
        geoJsonLayer.renderer = new SimpleRenderer({
          symbol: getMapPinSymbol({
            color: pointColour,
            sizeInPx: 36,
          }),
        });
      }
    }
    // Specify the legend title
    geoJsonLayer.title = localize(layer.title_multiloc);

    return geoJsonLayer;
  });
};

// handleWebMapReferenceLayers
// Description: Re-order any reference layers which are part of the WebMap's basemap
// These need to be re-ordered so they appear underneath any additional layers we create (E.g. Idea pins)
// API doc: https://developers.arcgis.com/javascript/latest/api-reference/esri-Basemap.html#referenceLayers
export const handleWebMapReferenceLayers = (
  webMap: WebMap,
  referenceLayers: Collection<Layer>
) => {
  // Add current basemap layers to new variable
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const newBasemapLayers = webMap.basemap?.baseLayers;
  // Append the reference layers to the new basemap layers list
  webMap.addMany(referenceLayers.toArray());
  // Set the WebMap basemap to this new list of layers
  webMap.basemap = new Basemap({
    baseLayers: newBasemapLayers,
  });
};

// applyHeatMapRenderer
// Description: Apply a heat map renderer to a point Feature layer
export const applyHeatMapRenderer = (layer: FeatureLayer, mapView: MapView) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (layer && mapView) {
    // Set up the parameters for the heatmapRendererCreator
    const heatmapParams = {
      layer,
      view: mapView,
    };

    // Esri heatmapRendererCreator creates a statistical heatmap configuration based on the data
    createRenderer(heatmapParams).then(function (response) {
      // Apply generated heatmap renderer to the layer
      layer.renderer = response.renderer;
    });
  }
};

// goToLayerExtent
// Description: Zoom to the extent of an Esri layer
export const goToLayerExtent = (
  layer: Layer,
  mapView: MapView,
  zoomOutFurther?: boolean
) => {
  mapView.goTo(layer.fullExtent, { animate: false }).then(() => {
    if (zoomOutFurther) {
      mapView.zoom = mapView.zoom - 1;
    }
  });
};

// Helper function to create user location marker
export const createUserLocationGraphic = (
  longitude: number,
  latitude: number
) => {
  const point = new Point({
    longitude,
    latitude,
  });

  const symbol = new SimpleMarkerSymbol({
    color: [51, 119, 255], // Blue color
    size: 12,
    outline: {
      color: [255, 255, 255], // White outline
      width: 2,
    },
    style: 'circle',
  });

  return new Graphic({
    geometry: point,
    symbol,
    attributes: {
      id: 'user-location',
      title: 'Your Location',
    },
  });
};
