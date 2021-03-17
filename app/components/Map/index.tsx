import React, { memo, useMemo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import LeafletMap from 'components/UI/LeafletMap';
import { Icon } from 'cl2-component-library';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

// utils
import { getCenter, getZoomLevel, getTileProvider } from 'utils/map';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { media, defaultOutline, defaultCardStyle } from 'utils/styleUtils';
import ideaMarkerIcon from './idea-marker.svg';

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

export interface IMapProps {
  centerCoordinates?: GeoJSON.Position;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoomLevel?: number;
  mapHeight?: string;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: React.FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: L.Map, position: L.LatLng) => void;
  fitBounds?: boolean;
  className?: string;
  projectId?: string | null;
  hideLegend?: boolean;
}

const Map = memo<IMapProps & InjectedLocalized>(
  ({
    centerCoordinates,
    zoomLevel,
    mapHeight,
    points,
    boxContent,
    onBoxClose,
    onMapClick,
    onMarkerClick,
    fitBounds,
    className,
  }) => {
    const appConfig = useAppConfiguration();

    const center = useMemo(() => {
      return getCenter(centerCoordinates, appConfig);
    }, [centerCoordinates, appConfig]);

    const zoom = useMemo(() => {
      return getZoomLevel(zoomLevel, appConfig);
    }, [zoomLevel, appConfig]);

    const tileProvider = useMemo(() => {
      return getTileProvider(appConfig);
    }, [appConfig]);

    const leafletMapProps = {
      points,
      zoom,
      center,
      tileProvider,
      fitBounds,
      onClick: onMapClick,
      onMarkerClick: onMarkerClick,
      marker: ideaMarkerIcon,
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
            {...leafletMapProps}
          />
        </MapWrapper>
      </Container>
    );
  };
);

export default injectLocalize(Map);
