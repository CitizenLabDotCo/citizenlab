import React, { useMemo } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { getMapPinSymbol } from 'components/EsriMap/utils';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import EsriMap from 'components/EsriMap';

type Props = {
  pointResponses: { answer: GeoJSON.Point }[];
};

const PointLocationQuestion = ({ pointResponses }: Props) => {
  // Create a point graphics list for responses
  const graphics = useMemo(() => {
    const responsesWithLocation = pointResponses?.map((response) => {
      return {
        type: 'Point',
        coordinates: [
          response.answer.coordinates[0],
          response.answer.coordinates[1],
        ],
      };
    });

    return responsesWithLocation?.map((response) => {
      const coordinates = response.coordinates;
      return new Graphic({
        geometry: new Point({
          longitude: coordinates?.[0],
          latitude: coordinates?.[1],
        }),
      });
    });
  }, [pointResponses]);

  // Create an Esri feature layer from the responses list so we can use it to create a heat map
  const responsesLayer = useMemo(() => {
    if (graphics) {
      return new FeatureLayer({
        source: graphics,
        title: 'TBD - TITLE', // TODO: Add message here.
        id: 'ideasLayer',
        objectIdField: 'ID',
        fields: [
          {
            name: 'ID',
            type: 'oid',
          },
        ],
        // Set the symbol used to render the graphics
        renderer: new Renderer({
          symbol: getMapPinSymbol({
            color: 'black',
            sizeInPx: 38,
          }),
        }),
      });
    }
    return undefined;
  }, [graphics]);

  return (
    <Box display="flex" gap="24px" mt="20px">
      <EsriMap height="400px" layers={responsesLayer ? [responsesLayer] : []} />
    </Box>
  );
};

export default PointLocationQuestion;
