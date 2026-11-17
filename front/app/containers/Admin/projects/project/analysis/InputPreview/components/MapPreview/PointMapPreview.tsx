import React, { useMemo } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { Point } from 'geojson';

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
  rawValue: Point;
};

const PointMapPreview = ({ rawValue }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const point = rawValue;

  // Create esri graphic from polygon
  const featureCollection: GeoJSON.FeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            coordinates: point?.coordinates,
          },
          properties: null,
        },
      ],
    }),
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    [point?.coordinates]
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
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {point?.coordinates ? (
        <EsriMap
          layers={layers}
          initialData={{
            onInit,
            showFullscreenOption: true,
            center: {
              type: 'Point',
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              coordinates: point?.coordinates,
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

export default PointMapPreview;
