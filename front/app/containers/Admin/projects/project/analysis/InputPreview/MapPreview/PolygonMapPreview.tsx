import React, { useMemo } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { Polygon } from 'geojson';

import { IMapLayerAttributes } from 'api/map_layers/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import {
  createEsriGeoJsonLayers,
  goToLayerExtent,
} from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  rawValue: Polygon;
};

const PolygonMapPreview = ({ rawValue }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const polygon = rawValue;

  // Create esri graphic from polygon
  const featureCollection: GeoJSON.FeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: polygon.coordinates,
          },
          properties: null,
        },
      ],
    }),
    [polygon.coordinates]
  );

  const mapLayer: IMapLayerAttributes = useMemo(
    () => ({
      id: 'polygon',
      geojson: featureCollection,
      type: 'CustomMaps::GeojsonLayer',
      title_multiloc: {},
      default_enabled: false,
    }),
    [featureCollection]
  );

  const layers = useMemo(
    () => createEsriGeoJsonLayers([mapLayer], localize),
    [localize, mapLayer]
  );

  const onInit = (mapView: MapView) => {
    layers[0].on('layerview-create', () => {
      goToLayerExtent(layers[0], mapView);
    });
  };

  return (
    <Box>
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {polygon.coordinates ? (
        <EsriMap
          layers={layers}
          initialData={{
            onInit,
            showFullscreenOption: true,
            center: {
              type: 'Point',
              coordinates: polygon.coordinates[0][0],
            },
          }}
          height="180px"
        />
      ) : (
        <Text>{formatMessage(messages.noAnswerProvided)}</Text>
      )}
    </Box>
  );
};

export default PolygonMapPreview;
