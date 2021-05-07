import React, { memo, useMemo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import LeafletMap from 'components/UI/LeafletMap';
import { Icon } from 'cl2-component-library';
import Outlet from 'components/Outlet';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// utils
import { getCenter, getZoomLevel, getTileProvider } from 'utils/map';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';

// styling
import styled from 'styled-components';
import { media, defaultOutline, defaultCardStyle } from 'utils/styleUtils';

export interface Point extends GeoJSON.Point {
  data?: any;
  id: string;
  title?: string;
}

const Container = styled.div`
  ${defaultCardStyle};
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
  centerCoordinates?: GeoJSON.Position;
  points?: Point[];
  zoomLevel?: number;
  areas?: GeoJSON.Polygon[];
  mapHeight?: string;
  noMarkerClustering?: boolean;
}

export interface IMapProps {
  onBoxClose?: (event: React.FormEvent) => void;
  className?: string;
  projectId?: string | null;
  hideLegend?: boolean;
  boxContent?: JSX.Element | null;
}

const Map = memo<IMapProps & IMapConfigProps>(
  ({
    projectId,
    centerCoordinates,
    zoomLevel,
    mapHeight,
    points,
    noMarkerClustering,
    boxContent,
    onBoxClose,
    className,
    hideLegend,
  }) => {
    const appConfig = useAppConfiguration();

    const baseMapConfigProps: IMapConfigProps = {
      centerCoordinates,
      zoomLevel,
      mapHeight,
      points,
    };

    const center = useMemo(() => {
      return getCenter(centerCoordinates, appConfig);
    }, [centerCoordinates, appConfig]);

    const zoom = useMemo(() => {
      return getZoomLevel(zoomLevel, appConfig);
    }, [zoomLevel, appConfig]);

    const tileProvider = useMemo(() => {
      return getTileProvider(appConfig);
    }, [appConfig]);

    const [leafletMapConfig, setLeafletMapConfig] = useState<ILeafletMapConfig>(
      {
        points,
        noMarkerClustering,
        zoom,
        center,
        tileProvider,
      }
    );

    const handleLeafletConfigChange = (newConfig: ILeafletMapConfig) => {
      setLeafletMapConfig((prevLeafletMapConfig) => ({
        ...prevLeafletMapConfig,
        ...newConfig,
      }));
    };

    const handleBoxOnClose = (event: React.FormEvent) => {
      event.preventDefault();
      onBoxClose?.(event);
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

          <LeafletMap
            id="mapid"
            className="e2e-map"
            mapHeight={mapHeight}
            {...leafletMapConfig}
          />
          <Outlet
            id="app.components.Map.leafletConfig"
            projectId={projectId}
            leafletConfig={leafletMapConfig}
            onLeafletConfigChange={handleLeafletConfigChange}
            {...baseMapConfigProps}
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
