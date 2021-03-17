import React, { memo, useMemo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import Legend from './Legend';
import LeafletMap from 'components/UI/LeafletMap';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from '../../../hooks/useMapConfig';

// typings
import { GeoJSONLayer, Point } from 'components/UI/LeafletMap/typings';

// utils
import { getCenter, getZoomLevel, getTileProvider } from '../../../utils/map';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import styled from 'styled-components';
import { media, defaultOutline, defaultCardStyle } from 'utils/styleUtils';
import ideaMarkerIcon from './idea-marker.svg';
import legendMarkerIcon from './legend-marker.svg';

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

interface Props {
  projectId?: string | null;
  centerCoordinates?: L.LatLngExpression;
  points?: Point[];
  areas?: GeoJSON.Polygon[];
  zoom?: number;
  mapHeight?: string;
  boxContent?: JSX.Element | null;
  onBoxClose?: (event: React.FormEvent) => void;
  onMarkerClick?: (id: string, data: any) => void;
  onMapClick?: (map: L.Map, position: L.LatLng) => void;
  fitBounds?: boolean;
  hideLegend?: boolean;
  className?: string;
}

const Map = memo<Props & InjectedLocalized>(
  ({
    projectId,
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
    hideLegend,
  }) => {
    const localize = useLocalize();
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const center = useMemo(() => {
      return getCenter(centerCoordinates, appConfig, mapConfig);
    }, [centerCoordinates, appConfig, mapConfig]);

    const zoom = useMemo(() => {
      return getZoomLevel(zoomLevel, appConfig, mapConfig);
    }, [zoomLevel, appConfig, mapConfig]);

    const tileProvider = useMemo(() => {
      return getTileProvider(appConfig, mapConfig);
    }, [appConfig, mapConfig]);

    const geoJsonLayers = useMemo(() => {
      if (!mapConfig) {
        return [];
      }

      return mapConfig.attributes.layers as GeoJSONLayer[];
    }, [projectId, mapConfig]);

    const leafletMapProps = {
      geoJsonLayers,
      points,
      zoom,
      center,
      tileProvider,
      fitBounds,
      onClick: onMapClick,
      onMarkerClick,
      marker: ideaMarkerIcon,
      layerMarker: (geojsonLayer: GeoJSONLayer, _latlng: L.LatLng) => {
        return geojsonLayer.marker_svg_url || legendMarkerIcon;
      },
      layerTooltip: (_layer: L.GeoJSON, feature: GeoJSON.Feature) => {
        return localize(feature?.properties?.tooltipContent);
      },
      layerPopup: (_layer: L.GeoJSON, feature: GeoJSON.Feature) => {
        return localize(feature?.properties?.popupContent);
      },
      layerOverlay: (geojsonLayer: GeoJSONLayer) => {
        return localize(geojsonLayer.title_multiloc);
      },
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
        {projectId && !hideLegend && <Legend projectId={projectId} />}
      </Container>
    );
  }
);

export default Map;
