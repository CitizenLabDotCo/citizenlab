import React, {
  memo,
  useMemo,
  useState,
  lazy,
  Suspense,
  useCallback,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import Outlet from 'components/Outlet';
const LeafletMap = lazy(() => import('components/UI/LeafletMap'));

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import {
  getCenter,
  getZoomLevel,
  getTileProvider,
  getTileOptions,
} from 'utils/map';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';

// styling
import styled from 'styled-components';
import { media, defaultOutline, defaultCardStyle } from 'utils/styleUtils';

// typings
import { LatLngTuple, Map as ILeafletMap } from 'leaflet';

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

const Container = styled.div`
  ${defaultCardStyle};
  background: transparent;
  border: solid 1px #ccc;
`;

const MapWrapper = styled.div`
  flex: 1;
  display: flex;
  position: relative;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 0;
  z-index: 1001;
  background: #fff;
  width: 100%;
  height: 80%;
  max-height: 550px;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  border-radius: 50%;
  border: solid 1px transparent;
  background: #fff;
  transition: all 100ms ease-out;
  outline: none !important;

  &:hover {
    background: #ececec;
  }

  &.focus-visible {
    ${defaultOutline};
  }

  ${media.phone`
    top: 4px;
    right: 4px;
  `}
`;

const CloseIcon = styled(Icon)`
  fill: #000;
`;

export interface IMapConfigProps {
  initialSelectedPointId?: string;
  centerLatLng?: LatLngTuple;
  points?: Point[];
  zoomLevel?: number;
  areas?: GeoJSON.Polygon[];
  mapHeight?: string;
  noMarkerClustering?: boolean;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  layersControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  singleClickEnabled?: boolean;
}

export interface IMapProps {
  onInit?: (map: ILeafletMap) => void;
  onBoxClose?: (event: React.FormEvent) => void;
  className?: string;
  projectId?: string | null;
  hideLegend?: boolean;
  boxContent?: JSX.Element | null;
}

const Map = memo<IMapProps & IMapConfigProps>(
  ({
    initialSelectedPointId,
    projectId,
    centerLatLng,
    zoomLevel,
    mapHeight,
    points,
    noMarkerClustering,
    zoomControlPosition,
    layersControlPosition,
    boxContent,
    onInit,
    onBoxClose,
    className,
    hideLegend,
    singleClickEnabled,
  }) => {
    const { data: appConfig, isLoading } = useAppConfiguration();
    const customMapsEnabled = useFeatureFlag({ name: 'custom_maps' });

    const [additionalLeafletConfig, setAdditionalLeafletConfig] =
      useState<ILeafletMapConfig | null>(null);

    const center = useMemo(() => {
      if (isLoading) return;

      return getCenter(centerLatLng, appConfig?.data);
    }, [isLoading, centerLatLng, appConfig]);

    const zoom = useMemo(() => {
      if (isLoading) return;

      return getZoomLevel(zoomLevel, appConfig?.data);
    }, [isLoading, zoomLevel, appConfig]);

    const tileProvider = useMemo(() => {
      if (isLoading) return;

      return getTileProvider(appConfig?.data);
    }, [isLoading, appConfig]);

    const tileOptions = useMemo(() => {
      return getTileOptions();
    }, []);

    const leafletConfig = useMemo(() => {
      if (!center || !zoom || !tileProvider) return;

      return {
        initialSelectedPointId,
        points,
        noMarkerClustering,
        zoom,
        center,
        tileProvider,
        tileOptions,
        zoomControlPosition,
        layersControlPosition,
        singleClickEnabled,
        ...additionalLeafletConfig,
      };
    }, [
      initialSelectedPointId,
      points,
      noMarkerClustering,
      zoom,
      center,
      tileProvider,
      tileOptions,
      zoomControlPosition,
      layersControlPosition,
      singleClickEnabled,
      additionalLeafletConfig,
    ]);

    const handleLeafletConfigChange = useCallback(
      (leafletConfig: ILeafletMapConfig) => {
        setAdditionalLeafletConfig(leafletConfig);
      },
      []
    );

    const handleBoxOnClose = (event: React.FormEvent) => {
      event.preventDefault();
      onBoxClose?.(event);
    };

    const handleOnInit = (map: L.Map) => {
      onInit?.(map);
    };

    if (!leafletConfig) return null;

    return (
      <Container className={className || ''}>
        <MapWrapper>
          {!isNilOrError(boxContent) && (
            <BoxContainer>
              <CloseButton onClick={handleBoxOnClose}>
                <CloseIcon name="close" />
              </CloseButton>

              {boxContent}
            </BoxContainer>
          )}

          {customMapsEnabled && additionalLeafletConfig === null ? null : (
            <Suspense fallback={false}>
              <LeafletMap
                id="mapid"
                className="e2e-leafletmap"
                mapHeight={mapHeight}
                onInit={handleOnInit}
                {...leafletConfig}
              />
            </Suspense>
          )}
          <Outlet
            id="app.components.Map.leafletConfig"
            projectId={projectId ?? undefined}
            onLeafletConfigChange={handleLeafletConfigChange}
            centerLatLng={centerLatLng}
            zoomLevel={zoomLevel}
            points={points}
          />
        </MapWrapper>

        {!hideLegend && (
          <Outlet
            id="app.components.Map.Legend"
            projectId={projectId ?? undefined}
          />
        )}
      </Container>
    );
  }
);

export default Map;
