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
import useAppConfiguration from 'hooks/useAppConfiguration';

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

  ${media.smallerThanMinTablet`
    top: 4px;
    right: 4px;
  `}
`;

const CloseIcon = styled(Icon)`
  width: 12px;
  height: 12px;
  fill: #000;
`;

export interface IMapConfigProps {
  centerLatLng?: LatLngTuple;
  points?: Point[];
  zoomLevel?: number;
  areas?: GeoJSON.Polygon[];
  mapHeight?: string;
  noMarkerClustering?: boolean;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  layersControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
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
  }) => {
    const appConfig = useAppConfiguration();

    const [additionalLeafletConfig, setAdditionalLeafletConfig] =
      useState<ILeafletMapConfig | null>(null);

    const center = useMemo(() => {
      return getCenter(centerLatLng, appConfig);
    }, [centerLatLng, appConfig]);

    const zoom = useMemo(() => {
      return getZoomLevel(zoomLevel, appConfig);
    }, [zoomLevel, appConfig]);

    const tileProvider = useMemo(() => {
      return getTileProvider(appConfig);
    }, [appConfig]);

    const tileOptions = useMemo(() => {
      return getTileOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tileProvider]);

    const leafletConfig = useMemo(() => {
      return {
        points,
        noMarkerClustering,
        zoom,
        center,
        tileProvider,
        tileOptions,
        zoomControlPosition,
        layersControlPosition,
        ...additionalLeafletConfig,
      };
    }, [
      points,
      noMarkerClustering,
      zoom,
      center,
      tileProvider,
      tileOptions,
      zoomControlPosition,
      layersControlPosition,
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

          <Suspense fallback={false}>
            <LeafletMap
              id="mapid"
              className="e2e-leafletmap"
              mapHeight={mapHeight}
              onInit={handleOnInit}
              {...leafletConfig}
            />
          </Suspense>
          <Outlet
            id="app.components.Map.leafletConfig"
            projectId={projectId}
            onLeafletConfigChange={handleLeafletConfigChange}
            centerLatLng={centerLatLng}
            zoomLevel={zoomLevel}
            points={points}
          />
        </MapWrapper>

        {!hideLegend && (
          <Outlet id="app.components.Map.Legend" projectId={projectId} />
        )}
      </Container>
    );
  }
);

export default Map;
