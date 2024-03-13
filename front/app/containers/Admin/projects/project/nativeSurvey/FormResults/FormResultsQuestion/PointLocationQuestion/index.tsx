import React, { useMemo, useState } from 'react';

import { Box, Spinner, Toggle } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import PointMap from 'components/admin/Graphs/PointMap';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import HeatmapTooltipContent from './HeatmapTooltipContent';

type Props = {
  pointResponses: { response: GeoJSON.Point }[];
  mapConfigId?: string;
  customFieldId?: string;
};

const PointLocationQuestion = ({
  pointResponses,
  mapConfigId,
  customFieldId,
}: Props) => {
  // const localize = useLocalize();
  const { formatMessage } = useIntl();

  // Get project from URL
  const { projectId } = useParams() as {
    projectId: string;
  };

  // State variables
  // const [mapView, setMapView] = useState<MapView | null>(null);
  const [showHeatMap, setShowHeatMap] = useState<boolean>(false);

  // Either get the custom map configuration or project level one
  const { data: customMapConfig, isLoading: isLoadingCustomMapConfig } =
    useMapConfigById(mapConfigId);
  const { data: projectMapConfig, isLoading: isLoadingProjectMapConfig } =
    useProjectMapConfig(projectId);
  const mapConfig = mapConfigId ? customMapConfig : projectMapConfig;
  const isLoading =
    (isLoadingCustomMapConfig && mapConfigId) || isLoadingProjectMapConfig;

  // Create circle symbol to use for point graphics
  // const circleSymbol = useMemo(() => {
  //   return new SimpleMarkerSymbol({
  //     color: colors.primary,
  //     style: 'circle',
  //     size: '18px',
  //     outline: {
  //       color: colors.white,
  //       width: 2,
  //     },
  //   });
  // }, []);

  // Get layers from mapConfig
  // const mapConfigLayers = useMemo(() => {
  //   return parseLayers(mapConfig, localize);
  // }, [mapConfig, localize]);

  const points = useMemo(() => {
    return pointResponses?.map(({ response }) => response);
  }, [pointResponses]);

  // Create a point graphics list from question responses
  // const graphics = useMemo(() => {
  //   const responsesWithLocation = pointResponses?.map(({ response }) => response);

  //   return responsesWithLocation?.map((response) => {
  //     const coordinates = response.coordinates;
  //     return new Graphic({
  //       geometry: new Point({
  //         longitude: coordinates?.[0],
  //         latitude: coordinates?.[1],
  //       }),
  //     });
  //   });
  // }, [pointResponses]);

  // // Create an Esri feature layer from the responses list so we can use it to create a heat map
  // const responsesLayer = useMemo(() => {
  //   if (graphics) {
  //     return new FeatureLayer({
  //       source: graphics,
  //       title: formatMessage(messages.responses),
  //       id: `responsesLayer_${customFieldId}`,
  //       objectIdField: 'ID',
  //       fields: [
  //         {
  //           name: 'ID',
  //           type: 'oid',
  //         },
  //       ],
  //       // Set the symbol used to render the graphics
  //       renderer: new Renderer({
  //         symbol: circleSymbol,
  //       }),
  //     });
  //   }
  //   return undefined;
  // }, [graphics, circleSymbol, customFieldId, formatMessage]);

  // const layers = useMemo(() => {
  //   return responsesLayer && mapConfigLayers
  //     ? [...mapConfigLayers, responsesLayer]
  //     : []
  // }, [responsesLayer, mapConfigLayers])

  // const onInit = useCallback(
  //   (mapView: MapView) => {
  //     setMapView(mapView);

  //     // Watch for map extent change. On change, re-calculate the heat map for the current data points in the extent.
  //     reactiveUtilsWhen(
  //       () => mapView?.stationary === true,
  //       () => {
  //         if (mapView?.extent && responsesLayer?.renderer.type === 'heatmap') {
  //           applyHeatMapRenderer(responsesLayer, mapView);
  //         }
  //       }
  //     );
  //   },
  //   [responsesLayer]
  // );

  // const toggleHeatMap = (showHeatMap: boolean) => {
  //   if (responsesLayer && mapView && showHeatMap) {
  //     applyHeatMapRenderer(responsesLayer, mapView);
  //   } else if (responsesLayer && mapView && !showHeatMap) {
  //     responsesLayer.renderer = new Renderer({
  //       symbol: circleSymbol,
  //     });
  //   }
  // };

  return (
    <Box>
      <Box mt="-32px" display="flex" justifyContent="flex-end" mb="8px">
        <Toggle
          checked={showHeatMap}
          onChange={() => {
            // toggleHeatMap(!showHeatMap);
            setShowHeatMap(!showHeatMap);
          }}
          label={<HeatmapTooltipContent />}
        />
      </Box>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <PointMap
            points={points}
            mapConfig={mapConfig}
            layerTitle={formatMessage(messages.responses)}
            layerId={`responsesLayer_${customFieldId}`}
            heatmap={showHeatMap}
          />
          {/* <ResetMapViewButton mapView={mapView} mapConfig={mapConfig} /> */}
        </>
      )}
    </Box>
  );
};

export default PointLocationQuestion;
