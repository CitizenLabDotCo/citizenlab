import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import IconButton from 'design-system/IconButton';
import DSSpinner from 'design-system/Spinner';
import Text from 'design-system/Text';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';
import useAddProjectMapConfig from 'api/map_config/useAddProjectMapConfig';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import projectMessages from 'containers/Admin/projects/project/messages';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import { MAP_CONFIG_SAVER_KEY } from 'components/admin/PageSaveContext/constants';
import ConfigurationMap from 'components/ConfigurationMap/ConfigurationMap';
import { goToMapLocation } from 'components/EsriMap/utils';
import Centerer from 'components/UI/Centerer';
import goBackMessages from 'components/UI/GoBackButton/messages';

import { useIntl } from 'utils/cl-intl';
import { getCenter, getZoomLevel } from 'utils/mapUtils/map';
import { useParams } from 'utils/router';

import styles from './CustomMapConfigPage.module.css';
import FeatureLayerUpload from './DataImportOptions/FeatureLayerUpload';
import WebMapUpload from './DataImportOptions/WebMapUpload';
import MapConfigOverview from './MapConfiguration/MapConfigOverview';
import StagedCenterAndZoom, {
  CenterAndZoomValues,
} from './MapConfiguration/StagedCenterAndZoom';
import messages from './messages';
import { isValidCenterAndZoom } from './utils';
import 'design-system/tokens.css';

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
  /** Uses the back-office workspace panels. */
  variant?: 'default' | 'panel';
  onBack?: () => void;
}

const MAP_SAVE_DELAY_MS = 650;

type SaveError = 'invalid_values' | 'request_failed';

const parseStaged = (values: CenterAndZoomValues) => {
  const lat = Number(values.lat.trim() || NaN);
  const lng = Number(values.lng.trim() || NaN);
  const zoom = Number(values.zoom.trim() || NaN);

  return Number.isInteger(zoom) && isValidCenterAndZoom(lat, lng, zoom)
    ? {
        center: { type: 'Point' as const, coordinates: [lng, lat] },
        zoom,
      }
    : null;
};

const CustomMapConfigPage = memo<Props>((props) => {
  const { className, passedMapConfig, variant = 'default', onBack } = props;
  const isPanel = variant === 'panel';
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as {
    projectId: string;
  };
  const { data: appConfig } = useAppConfiguration();
  const { mutate: createProjectMapConfig } = useAddProjectMapConfig();
  const { data: projectMapConfig, isFetching } = useProjectMapConfig(projectId);
  const [view, setView] = useState<ViewOptions>('main');
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [staged, setStaged] = useState<CenterAndZoomValues | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<{
    values: CenterAndZoomValues;
    reason: SaveError;
  }>();
  const pending = useRef<{
    values: CenterAndZoomValues;
    promise: Promise<void>;
  }>();
  const { mutateAsync: updateMapConfig } = useUpdateMapConfig(projectId);

  const config = passedMapConfig ?? projectMapConfig;
  const mapConfig = config?.data ? config : undefined;
  const mapConfigId = mapConfig?.data.id;
  const stagedError =
    saveError && saveError.values === staged ? saveError.reason : undefined;
  const defaultLatLng = getCenter(undefined, appConfig?.data, mapConfig?.data);
  const defaultLat = defaultLatLng[0];
  const defaultLng = defaultLatLng[1];
  const defaultZoom = getZoomLevel(undefined, appConfig?.data, mapConfig?.data);

  const saveStaged = useCallback(async () => {
    if (!staged || !mapConfigId) return;
    if (pending.current?.values === staged) return pending.current.promise;

    const parsed = parseStaged(staged);
    if (!parsed) {
      setSaveError({ values: staged, reason: 'invalid_values' });
      throw new Error('Invalid map center or zoom');
    }

    // Keep edits in order even when leaving the workspace triggers a save.
    const previous = pending.current?.promise ?? Promise.resolve();
    const promise: Promise<void> = previous
      .catch(() => undefined)
      .then(async () => {
        try {
          await updateMapConfig({
            mapConfigId,
            center_geojson: parsed.center,
            zoom_level: parsed.zoom.toString(),
          });
          setStaged((current) => (current === staged ? null : current));
          setSaved(true);
        } catch (error) {
          setSaveError({ values: staged, reason: 'request_failed' });
          throw error;
        }
      })
      .finally(() => {
        if (pending.current?.promise === promise) pending.current = undefined;
      });

    pending.current = { values: staged, promise };
    return promise;
  }, [mapConfigId, staged, updateMapConfig]);

  useRegisterPageSaver(MAP_CONFIG_SAVER_KEY, {
    dirty: !!staged,
    save: saveStaged,
  });

  useEffect(() => {
    if (!isPanel || !staged || stagedError) return;

    const timeout = window.setTimeout(() => {
      saveStaged().catch(() => undefined);
    }, MAP_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isPanel, saveStaged, staged, stagedError]);

  // The map follows typed values, so they can be checked before saving.
  const stageTyped = (values: CenterAndZoomValues) => {
    setStaged(values);

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
      !mapConfig
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

  if (projectId && mapConfig) {
    const featureLayerUpload = (
      <FeatureLayerUpload
        setView={setView}
        variant={variant}
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mapConfigId={mapConfig?.data.id}
      />
    );
    const webMapUpload = (
      <WebMapUpload
        setView={setView}
        variant={variant}
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        mapConfigId={mapConfig?.data.id}
      />
    );
    const settings = (
      <>
        {view === 'main' &&
          (isPanel ? (
            <MapConfigOverview
              className={styles.settingsColumn}
              setView={setView}
              mapView={mapView}
              mapConfig={mapConfig}
              variant={variant}
              centerAndZoom={
                <StagedCenterAndZoom
                  mapConfig={mapConfig}
                  staged={staged}
                  error={stagedError}
                  onRetry={() => {
                    setSaveError(undefined);
                    saveStaged().catch(() => undefined);
                  }}
                  onChange={stageTyped}
                />
              }
            />
          ) : (
            <StyledMapConfigOverview
              setView={setView}
              mapView={mapView}
              mapConfig={mapConfig}
              variant={variant}
            />
          ))}
        {view === 'featureLayerUpload' &&
          (isPanel ? (
            <div className={styles.settingsColumn}>{featureLayerUpload}</div>
          ) : (
            <Box flex="0 0 520px" width="520px">
              {featureLayerUpload}
            </Box>
          ))}
        {view === 'webMapUpload' &&
          (isPanel ? (
            <div className={styles.settingsColumn}>{webMapUpload}</div>
          ) : (
            <Box flex="0 0 520px" width="520px">
              {webMapUpload}
            </Box>
          ))}
      </>
    );
    const map = (
      <ConfigurationMap
        mapConfig={mapConfig}
        setParentMapView={setMapView}
        height={isPanel ? '100%' : undefined}
        onSaveZoom={
          isPanel
            ? ({ lat, lng, zoom }) => {
                setStaged({
                  lat: lat.toString(),
                  lng: lng.toString(),
                  zoom: Math.trunc(Number(zoom)).toString(),
                });
              }
            : undefined
        }
      />
    );

    if (isPanel) {
      return (
        <div className={styles.workspace}>
          <div className={styles.settingsPanel}>
            <div className={styles.settingsHeader}>
              {onBack && (
                <IconButton
                  icon="arrow-left-16"
                  aria-label={formatMessage(goBackMessages.goBack)}
                  onPress={onBack}
                />
              )}
              <h2 className={styles.settingsTitle}>
                {formatMessage(projectMessages.configureMap)}
              </h2>
              <Text role="status" variant="small" tone="secondary">
                {!staged && saved && formatMessage(messages.mapPositionSaved)}
              </Text>
            </div>
            {settings}
          </div>
          <div className={styles.mapPanel}>
            <div className={styles.mapFrame}>{map}</div>
          </div>
        </div>
      );
    }

    return (
      <Container className={className || ''}>
        {settings}
        <MapWrapper>{map}</MapWrapper>
      </Container>
    );
  }

  if (isPanel) {
    return (
      <div className={styles.loading}>
        <DSSpinner />
      </div>
    );
  }

  return (
    <Centerer height="500px">
      <Spinner />
    </Centerer>
  );
});

export default CustomMapConfigPage;
