import React, { useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import LineMap from 'components/admin/Graphs/LineMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  lineResponses: { response: GeoJSON.LineString }[];
  mapConfigId?: string;
  customFieldId?: string;
};

const LineLocationQuestion = ({
  lineResponses,
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

  const lines = useMemo(() => {
    return lineResponses?.map(({ response }) => response);
  }, [lineResponses]);

  return (
    <Box>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <LineMap
            lines={lines}
            mapConfig={mapConfig}
            layerTitle={formatMessage(messages.responses)}
            layerId={`responsesLayer_${customFieldId}`}
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

export default LineLocationQuestion;
