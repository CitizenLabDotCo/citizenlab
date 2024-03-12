import React, { memo, useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddMapConfig from 'api/map_config/useAddMapConfig';
import useMapConfig from 'api/map_config/useMapConfig';

import Centerer from 'components/UI/Centerer';

import IdeationConfigurationMap from '../../../components/IdeationConfigurationMap/IdeationConfigurationMap';
import { getCenter, getZoomLevel } from '../../../utils/mapUtils/map';

import FeatureLayerUpload from './DataImportOptions/FeatureLayerUpload';
import WebMapUpload from './DataImportOptions/WebMapUpload';
import MapConfigOverview from './MapConfiguration/MapConfigOverview';

const Container = styled.div`
  display: flex;
`;

const StyledMapConfigOverview = styled(MapConfigOverview)`
  flex: 0 0 520px;
  width: 520px;
`;

const MapWrapper = styled.div`
  flex: 1;
  margin-left: 60px;
  position: relative;
  height: 700px;
`;

export type ViewOptions = 'main' | 'featureLayerUpload' | 'webMapUpload';

interface Props {
  className?: string;
}

const ProjectCustomMapConfigPage = memo<Props>(({ className }) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const { data: appConfig } = useAppConfiguration();
  const { mutate: createProjectMapConfig } = useAddMapConfig();
  const { data: mapConfig, isFetching } = useMapConfig(projectId);
  const [view, setView] = useState<ViewOptions>('main');
  const [mapView, setMapView] = useState<MapView | null>(null);

  const defaultLatLng = getCenter(undefined, appConfig?.data, mapConfig?.data);
  const defaultLat = defaultLatLng[0];
  const defaultLng = defaultLatLng[1];
  const defaultZoom = getZoomLevel(undefined, appConfig?.data, mapConfig?.data);

  useEffect(() => {
    // Since we return {data: null}, that is not sent back here so the useEffect on the mapConfig will not
    // be triggered. The isFetching will help us counter that but we probably need to fix this in the api or fetcher
    if (
      projectId &&
      appConfig &&
      !isFetching &&
      (mapConfig?.data === null || !mapConfig)
    ) {
      createProjectMapConfig({
        projectId,
        center_geojson: {
          type: 'Point',
          coordinates: [defaultLng, defaultLat],
        },
        zoom_level: defaultZoom.toString(),
      });
    }
  }, [
    projectId,
    appConfig,
    mapConfig,
    defaultLat,
    defaultLng,
    defaultZoom,
    createProjectMapConfig,
    isFetching,
  ]);

  if (projectId && mapConfig?.data?.id) {
    return (
      <Container className={className || ''}>
        {view === 'main' && (
          <StyledMapConfigOverview
            projectId={projectId}
            setView={setView}
            mapView={mapView}
          />
        )}

        {view === 'featureLayerUpload' && (
          <Box flex="0 0 520px" width="520px">
            <FeatureLayerUpload
              projectId={projectId}
              setView={setView}
              mapConfigId={mapConfig?.data.id}
            />
          </Box>
        )}

        {view === 'webMapUpload' && (
          <Box flex="0 0 520px" width="520px">
            <WebMapUpload
              projectId={projectId}
              setView={setView}
              mapConfigId={mapConfig?.data.id}
            />
          </Box>
        )}

        <MapWrapper>
          <IdeationConfigurationMap
            mapConfig={mapConfig}
            projectId={projectId}
            setParentMapView={setMapView}
          />
        </MapWrapper>
      </Container>
    );
  }

  return (
    <Centerer height="500px">
      <Spinner />
    </Centerer>
  );
});

export default ProjectCustomMapConfigPage;
