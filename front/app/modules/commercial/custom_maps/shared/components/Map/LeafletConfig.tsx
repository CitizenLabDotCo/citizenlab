import { memo, useMemo, useEffect } from 'react';

// components
import { IMapConfigProps } from 'components/Map';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from '../../../hooks/useMapConfig';

// typings
import { GeoJSONLayer } from 'components/UI/LeafletMap/typings';

// utils
import { getCenter, getZoomLevel, getTileProvider } from '../../../utils/map';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import ideaMarkerIcon from './idea-marker.svg';
import legendMarkerIcon from './legend-marker.svg';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';

interface Props {
  leafletConfig: ILeafletMapConfig;
  onLeafletConfigChange: (newLeafletConfig: ILeafletMapConfig) => void;
  projectId?: string | null;
}

const LeafletConfig = memo<Props & IMapConfigProps>(
  ({
    onLeafletConfigChange,
    projectId,
    centerCoordinates,
    zoomLevel,
    points,
    onMapClick,
    onMarkerClick,
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

    const newLeafletConfig = useMemo(() => {
      const tileOptions = {
        attribution:
          '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
      };

      return {
        geoJsonLayers,
        points,
        zoom,
        center,
        tileProvider,
        tileOptions,
        onMarkerClick,
        onClick: onMapClick,
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
    }, [
      geoJsonLayers,
      points,
      zoom,
      center,
      tileProvider,
      onMarkerClick,
      onMapClick,
    ]);

    useEffect(() => {
      onLeafletConfigChange(newLeafletConfig);
    }, [newLeafletConfig]);

    return null;
  }
);

export default LeafletConfig;
