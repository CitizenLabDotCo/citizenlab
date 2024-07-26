import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { Polygon } from 'geojson';

import { IMapLayerAttributes } from 'api/map_layers/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import {
  createEsriGeoJsonLayers,
  goToLayerExtent,
} from 'components/EsriMap/utils';

type Props = {
  rawValue: Polygon;
};

const PolygonMapPreview = ({ rawValue }: Props) => {
  const localize = useLocalize();
  const polygon = rawValue;

  // Create esri graphic from polygon
  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polygon?.coordinates,
        },
        properties: null,
      },
    ],
  };

  const mapLayer: IMapLayerAttributes = {
    id: 'polygon',
    geojson: featureCollection,
    type: 'CustomMaps::GeojsonLayer',
    title_multiloc: {},
    default_enabled: false,
  };

  const layers = createEsriGeoJsonLayers([mapLayer], localize);

  const onInit = (mapView: MapView) => {
    layers[0].on('layerview-create', () => {
      goToLayerExtent(layers[0], mapView);
    });
  };

  return (
    <Box>
      <EsriMap
        layers={layers}
        initialData={{
          onInit,
          showFullscreenOption: true,
          center: {
            type: 'Point',
            coordinates: polygon?.coordinates[0][0],
          },
        }}
        height="180px"
      />
    </Box>
  );
};

export default PolygonMapPreview;
