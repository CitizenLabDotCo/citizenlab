import { colors } from '@citizenlab/cl2-component-library';

// components
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';

// constants
import {
  BASEMAP_AT_ATTRIBUTION,
  DEFAULT_TILE_PROVIDER,
  MAPTILER_ATTRIBUTION,
} from './constants';

// components
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import FeatureReductionCluster from '@arcgis/core/layers/support/FeatureReductionCluster';
import MapView from '@arcgis/core/views/MapView';

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
  return new WebTileLayer({
    urlTemplate: tileProvider || DEFAULT_TILE_PROVIDER,
    copyright: getTileAttribution(tileProvider || ''),
  });
};

// getTileAttribution
// Description: Gets the correct tile attribution given a certain tileProvider URL.
const getTileAttribution = (tileProvider: string): string => {
  if (tileProvider?.includes('maptiler')) {
    return MAPTILER_ATTRIBUTION;
  }

  if (tileProvider?.includes('wien.gv.at/basemap')) {
    return BASEMAP_AT_ATTRIBUTION;
  }

  return MAPTILER_ATTRIBUTION; // MapTiler Basic is the default map
};

// getMapPinSymbol
// Description: Get a map pin symbol (with an optional color value)
export const getMapPinSymbol = (color?: string) => {
  return new SimpleMarkerSymbol({
    color,
    outline: {
      color: colors.white,
    },
    size: '38px',
    xoffset: 0,
    yoffset: 15,
    path: 'M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z',
  });
};

// getShapeSymbol
// Description: Get a simple shape symbol (with an optional outline width & color value)
type SimpleShape = 'circle' | 'square' | 'cross' | 'diamond' | 'triangle' | 'x';
export const getShapeSymbol = (
  shape: SimpleShape,
  color?: string,
  outlineWidth?: number
) => {
  return new SimpleMarkerSymbol({
    style: shape,
    color: color || colors.white,
    outline: {
      color: 'rgba(255, 255, 255, 0.2)',
      width: outlineWidth || 1,
    },
  });
};

// changeCursorOnHover
// Description: On map hover, change the cursor to pointer if hovering over a graphic
export const changeCursorOnHover = (event: any, mapView: MapView) => {
  mapView.hitTest(event).then((result) => {
    if (result.results.length > 0) {
      // Hovering over marker(s)
      result.results.forEach((r) => {
        if (r.type === 'graphic') {
          // Change cursor to pointer
          document.body.style.cursor = 'pointer';
        }
      });
    } else {
      document.body.style.cursor = 'auto';
    }
  });
};

// getClusterConfiguration
// Description: Gets the configuration needed to render a FeatureLayer with clustering on zoom in/out
export const getClusterConfiguration = (clusterSymbolColor?: string) => {
  return new FeatureReductionCluster({
    clusterRadius: '60px',
    clusterMinSize: '32px',
    clusterMaxSize: '44px',
    symbol: getShapeSymbol(
      'circle',
      clusterSymbolColor || colors.coolGrey700,
      3
    ),
    labelingInfo: [
      {
        deconflictionStrategy: 'none',
        labelExpressionInfo: {
          // {cluster_count} is a field containing
          // the number of features in the cluster
          expression: "Text($feature.cluster_count, '#,###')",
        },
        symbol: {
          type: 'text',
          color: colors.white,
          font: {
            weight: 'bold',
            family: 'Noto Sans',
            size: '14px',
          },
        },
        labelPlacement: 'center-center',
      },
    ],
  });
};
