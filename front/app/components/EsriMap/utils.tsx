import { colors } from '@citizenlab/cl2-component-library';

// ArcGIS
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import Layer from '@arcgis/core/layers/Layer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Popup from '@arcgis/core/widgets/Popup';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import FeatureReductionCluster from '@arcgis/core/layers/support/FeatureReductionCluster';
import MapView from '@arcgis/core/views/MapView';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

// utils
import { hexToRGBA } from 'utils/helperUtils';

// types
import { Localize } from 'hooks/useLocalize';
import { IMapLayerAttributes } from 'api/map_layers/types';

// constants
import {
  BASEMAP_AT_ATTRIBUTION,
  DEFAULT_TILE_PROVIDER,
  MAPTILER_ATTRIBUTION,
} from './constants';

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
    `https://unpkg.com/@icon/maki-icons/icons/${iconName.toLowerCase()}.svg`
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
export const getShapeSymbol = (
  shape: SimpleShape,
  color?: string,
  outlineWidth?: number
) => {
  return new SimpleMarkerSymbol({
    style: shape,
    color: color || colors.white,
    outline: {
      color: hexToRGBA(colors.white, 0.2),
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

// goToMapLocation
// Description: Center a specific location on the map
export const goToMapLocation = async (
  coordinates: GeoJSON.Point,
  mapView: MapView,
  zoomLevel?: number
) => {
  mapView
    .goTo(
      {
        center: [coordinates.coordinates[0], coordinates.coordinates[1]],
        zoom: zoomLevel || mapView.zoom,
      },
      {
        duration: 1000,
        easing: 'ease-in-out',
      }
    )
    .catch(() => {
      // Do nothing
    });
};

// esriPointToGeoJson
// Description: Converts an Esri point to an GeoJSON.Point
export const esriPointToGeoJson = (esriPoint: Point): GeoJSON.Point => {
  return {
    type: 'Point',
    coordinates: [esriPoint.longitude, esriPoint.latitude],
  };
};

// getClusterConfiguration
// Description: Gets the configuration needed to render a FeatureLayer with clustering on zoom in/out
export const getClusterConfiguration = (clusterSymbolColor?: string) => {
  return new FeatureReductionCluster({
    maxScale: 600, // Stop clustering once fully zoomed in
    clusterMinSize: '20',
    symbol: getShapeSymbol(
      'circle',
      clusterSymbolColor || colors.coolGrey700,
      3
    ),
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
// Usage: This is used by the Initiative Map and Idea Map to show "Submit" buttons on map click.
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
  goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
    // Create an Esri popup
    mapView.popup = new Popup({
      collapseEnabled: false,
      dockEnabled: false,
      dockOptions: {
        buttonEnabled: false,
        breakpoint: false,
      },
      location: event.mapPoint,
      title: popupTitle,
    });
    // Set content of the popup to the node we created (so we can insert our React component via a portal)
    mapView.popup.content = popupContentNode;
    // Close any open UI elements and open the popup
    setSelectedInput(null);
    mapView.openPopup();
  });
};

// createEsriFeatureLayers
// Description: Create list of Esri GeoJSON layers from a list of IMapLayerAttributes
export const createEsriFeatureLayers = (
  layers: IMapLayerAttributes[],
  localize: Localize
) => {
  // create new Feature Layers from the Map Config layers
  const esriLayers: Layer[] = [];
  layers.map((layer) => {
    if (localize(layer.title_multiloc)) {
      const title = localize(layer.title_multiloc);

      // Extract number of sublayers if present
      const titleSplit = title.indexOf('(');
      const subLayerCount = parseInt(
        title.substring(titleSplit + 1, title.length - 1),
        10
      );

      // If we have sublayers, add a feature layer for each
      if (subLayerCount > 1) {
        for (let i = 0; i < subLayerCount; i++) {
          esriLayers.push(
            new FeatureLayer({
              url: `${layer.layer_url}/${i + 1}`,
              id: `${layer.layer_url}_internal`,
            })
          );
        }
      } else {
        // Otherwise, just add the single feature layer
        esriLayers.push(
          new FeatureLayer({
            url: layer.layer_url,
            id: `${layer.layer_url}_internal`,
          })
        );
      }
    }
  });
  return esriLayers;
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
      url,
      customParameters: {
        layerId: layer.id,
      },
    });

    // All features in a layer will have the same geometry, so we can just check the first feature
    const geometryType = layer.geojson?.features[0].geometry?.type;

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
          }),
        });
      }
    }
    // Specify the legend title
    geoJsonLayer.title = localize(layer.title_multiloc);

    return geoJsonLayer;
  });
};
