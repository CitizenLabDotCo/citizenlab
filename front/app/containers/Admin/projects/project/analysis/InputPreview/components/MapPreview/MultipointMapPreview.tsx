import React, { useMemo } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { MultiPoint } from 'geojson';

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
  rawValue: MultiPoint;
};

const MultipointMapPreview = ({ rawValue }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const multipoint = rawValue;

  // Create esri graphic from the multipoint
  const featureCollection: GeoJSON.FeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            coordinates: multipoint?.coordinates,
          },
          properties: null,
        },
      ],
    }),
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    [multipoint?.coordinates]
  );

  const mapLayer: IMapLayerAttributes = useMemo(
    () => ({
      id: 'multipoint',
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
      {multipoint?.coordinates?.length ? (
        <EsriMap
          layers={layers}
          initialData={{
            onInit,
            showFullscreenOption: true,
            center: {
              type: 'Point',
              coordinates: multipoint.coordinates[0],
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

export default MultipointMapPreview;
