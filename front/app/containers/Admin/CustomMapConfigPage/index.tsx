import React, { memo, useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  Spinner,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';
import useAddProjectMapConfig from 'api/map_config/useAddProjectMapConfig';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import ConfigurationMap from 'components/ConfigurationMap/ConfigurationMap';
import { goToMapLocation } from 'components/EsriMap/utils';
import Centerer from 'components/UI/Centerer';
import goBackMessages from 'components/UI/GoBackButton/messages';

import { useIntl } from 'utils/cl-intl';
import { getCenter, getZoomLevel } from 'utils/mapUtils/map';
import { useParams } from 'utils/router';

import FeatureLayerUpload from './DataImportOptions/FeatureLayerUpload';
import WebMapUpload from './DataImportOptions/WebMapUpload';
import MapConfigOverview from './MapConfiguration/MapConfigOverview';
import StagedCenterAndZoom, {
  CenterAndZoomValues,
} from './MapConfiguration/StagedCenterAndZoom';
import messages from './messages';
import { isValidCenterAndZoom } from './utils';

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

export const MAP_CONFIG_SAVER_KEY = 'map-config';

interface Props {
  className?: string;
  passedMapConfig?: IMapConfig;
  /** `bo` lays the settings and the map out as back-office workspace panels. */
  variant?: 'default' | 'bo';
  onBack?: () => void;
}

const CustomMapConfigPage = memo<Props>((props) => {
  const { className, passedMapConfig, variant = 'default', onBack } = props;
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as {
    projectId: string;
  };
  const { data: appConfig } = useAppConfiguration();
  const { mutate: createProjectMapConfig } = useAddProjectMapConfig();
  const { data: projectMapConfig, isFetching } = useProjectMapConfig(projectId);
  const [view, setView] = useState<ViewOptions>('main');
  const [mapView, setMapView] = useState<MapView | null>(null);
  // In the workspace, center and zoom edits wait for the page's save button.
  const [staged, setStaged] = useState<CenterAndZoomValues | null>(null);
  const [stagedInvalid, setStagedInvalid] = useState(false);
  const { mutateAsync: updateMapConfig } = useUpdateMapConfig(projectId);

  const mapConfig = passedMapConfig || projectMapConfig;
  const defaultLatLng = getCenter(undefined, appConfig?.data, mapConfig?.data);
  const defaultLat = defaultLatLng[0];
  const defaultLng = defaultLatLng[1];
  const defaultZoom = getZoomLevel(undefined, appConfig?.data, mapConfig?.data);

  const parseStaged = (values: CenterAndZoomValues) => {
    const lat = parseFloat(values.lat);
    const lng = parseFloat(values.lng);
    const zoom = parseInt(values.zoom, 10);

    return isValidCenterAndZoom(lat, lng, zoom)
      ? {
          center: { type: 'Point' as const, coordinates: [lng, lat] },
          zoom,
        }
      : null;
  };

  const saveStaged = async () => {
    if (!staged || !mapConfig) return;

    const parsed = parseStaged(staged);
    if (!parsed) {
      setStagedInvalid(true);
      throw new Error('Invalid map center or zoom');
    }

    await updateMapConfig({
      mapConfigId: mapConfig.data.id,
      center_geojson: parsed.center,
      zoom_level: parsed.zoom.toString(),
    });
    setStaged(null);
  };

  useRegisterPageSaver(MAP_CONFIG_SAVER_KEY, {
    dirty: !!staged,
    save: saveStaged,
  });

  // The map follows typed values, so they can be checked before saving.
  const stageTyped = (values: CenterAndZoomValues) => {
    setStaged(values);
    setStagedInvalid(false);

    const parsed = parseStaged(values);
    if (mapView && parsed) {
      goToMapLocation(parsed.center, mapView, parsed.zoom);
    }
  };

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
    const settings = (
      <>
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {view === 'main' && mapConfig && (
          <StyledMapConfigOverview
            setView={setView}
            mapView={mapView}
            mapConfig={mapConfig}
            variant={variant}
            centerAndZoom={
              variant === 'bo' && (
                <StagedCenterAndZoom
                  mapConfig={mapConfig}
                  staged={staged}
                  invalid={stagedInvalid}
                  onChange={stageTyped}
                />
              )
            }
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
      </>
    );
    const map = (
      <ConfigurationMap
        mapConfig={mapConfig}
        setParentMapView={setMapView}
        height={variant === 'bo' ? '100%' : undefined}
        onSaveZoom={
          variant === 'bo'
            ? ({ lat, lng, zoom }) => {
                setStaged({ lat: lat.toString(), lng: lng.toString(), zoom });
                setStagedInvalid(false);
              }
            : undefined
        }
      />
    );

    if (variant === 'bo') {
      return (
        <Box display="flex" gap="8px" h="100%" background={colors.background}>
          {/* Fits the 520px settings column, its padding and a scrollbar. */}
          <Box
            flex="0 0 580px"
            overflowY="auto"
            p="16px 18px"
            borderRadius={bo.panelBorderRadius}
            background={colors.white}
          >
            <Box display="flex" alignItems="center" gap="8px" mb="8px">
              {onBack && (
                <Button
                  buttonStyle="bo-text"
                  icon="arrow-left"
                  iconSize="16px"
                  width="28px"
                  height="28px"
                  padding="0"
                  ariaLabel={formatMessage(goBackMessages.goBack)}
                  onClick={onBack}
                />
              )}
              <Text variant="boSection" fontSize="m" m="0">
                {formatMessage(messages.mapConfigurationTitle)}
              </Text>
            </Box>
            {settings}
          </Box>
          <Box
            flexGrow={1}
            p="16px"
            borderRadius={bo.panelBorderRadius}
            background={colors.grey100}
          >
            <Box
              position="relative"
              h="100%"
              overflow="hidden"
              borderRadius={bo.panelBorderRadius}
              border={`1px solid ${colors.grey300}`}
            >
              {map}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Container className={className || ''}>
        {settings}
        <MapWrapper>{map}</MapWrapper>
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
