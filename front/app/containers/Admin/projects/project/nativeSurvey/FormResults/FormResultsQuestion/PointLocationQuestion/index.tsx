import React, { useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner, Toggle } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import PointMap from 'components/admin/Graphs/PointMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';

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
  const { formatMessage } = useIntl();
  const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Get project from URL
  const { projectId } = useParams() as {
    projectId: string;
  };

  // State variables
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [showHeatMap, setShowHeatMap] = useState<boolean>(false);

  // Add reset button to the map
  useEffect(() => {
    mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
  }, [mapView?.ui, resetButtonRef]);

  // Either get the custom map configuration or project level one
  const { data: customMapConfig, isLoading: isLoadingCustomMapConfig } =
    useMapConfigById(mapConfigId);
  const { data: projectMapConfig, isLoading: isLoadingProjectMapConfig } =
    useProjectMapConfig(projectId);
  const mapConfig = mapConfigId ? customMapConfig : projectMapConfig;
  const isLoading =
    (isLoadingCustomMapConfig && mapConfigId) || isLoadingProjectMapConfig;

  const points = useMemo(() => {
    return pointResponses?.map(({ response }) => response);
  }, [pointResponses]);

  return (
    <Box>
      <Box mt="-32px" display="flex" justifyContent="flex-end" mb="8px">
        <Toggle
          checked={showHeatMap}
          onChange={() => {
            setShowHeatMap((showHeatMap) => !showHeatMap);
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
            onInit={setMapView}
          />
          <ResetMapViewButton
            mapView={mapView}
            mapConfig={mapConfig}
            resetButtonRef={resetButtonRef}
          />
        </>
      )}
    </Box>
  );
};

export default PointLocationQuestion;
