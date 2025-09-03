import React, { memo, useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';
import useAddProjectMapConfig from 'api/map_config/useAddProjectMapConfig';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import ConfigurationMap from 'components/ConfigurationMap/ConfigurationMap';
import Centerer from 'components/UI/Centerer';

import { getCenter, getZoomLevel } from 'utils/mapUtils/map';

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
  passedMapConfig?: IMapConfig;
}

const CustomMapConfigPage = memo<Props>(({ className, passedMapConfig }) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const { data: appConfig } = useAppConfiguration();
  const { mutate: createProjectMapConfig } = useAddProjectMapConfig();
  const { data: projectMapConfig, isFetching } = useProjectMapConfig(projectId);
  const [view, setView] = useState<ViewOptions>('main');
  const [mapView, setMapView] = useState<MapView | null>(null);

  const mapConfig = passedMapConfig || projectMapConfig;
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
      !isFetching && // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (projectId && mapConfig?.data?.id) {
    return (
      <Container className={className || ''}>
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {view === 'main' && mapConfig && (
          <StyledMapConfigOverview
            setView={setView}
            mapView={mapView}
            mapConfig={mapConfig}
          />
        )}
        {view === 'featureLayerUpload' && (
          <Box flex="0 0 520px" width="520px">
            <FeatureLayerUpload
              setView={setView}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              mapConfigId={mapConfig?.data.id}
            />
          </Box>
        )}
        {view === 'webMapUpload' && (
          <Box flex="0 0 520px" width="520px">
            {/* TODO: Fix this the next time the file is edited. */}
            {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
            <WebMapUpload setView={setView} mapConfigId={mapConfig?.data.id} />
          </Box>
        )}
        <MapWrapper>
          <ConfigurationMap
            mapConfig={mapConfig}
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

export default CustomMapConfigPage;
