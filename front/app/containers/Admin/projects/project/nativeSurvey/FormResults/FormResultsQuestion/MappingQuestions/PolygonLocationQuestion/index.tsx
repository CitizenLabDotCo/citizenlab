import React, { useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import PolygonMap from 'components/admin/Graphs/PolygonMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';
import ExportGeoJSONButton from '../components/ExportGeoJSONButton';

type Props = {
  polygonResponses: { answer: GeoJSON.Polygon }[];
  mapConfigId?: string;
  customFieldId: string;
};

const PolygonLocationQuestion = ({
  polygonResponses,
  mapConfigId,
  customFieldId,
}: Props) => {
  const { formatMessage } = useIntl();
  const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Get project from URL
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  // State variables
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Add reset button to the map
  useEffect(() => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const polygons = useMemo(() => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return polygonResponses?.map(({ answer }) => answer);
  }, [polygonResponses]);

  return (
    <Box>
      <ExportGeoJSONButton customFieldId={customFieldId} phaseId={phaseId} />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <PolygonMap
            polygons={polygons}
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

export default PolygonLocationQuestion;
