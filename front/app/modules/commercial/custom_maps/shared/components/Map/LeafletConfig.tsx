import { memo, useMemo, useEffect, useCallback } from 'react';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import {
  getCenter,
  getZoomLevel,
  getTileProvider,
  getTileOptions,
} from '../../../utils/map';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import legendMarkerIcon from './legend-marker.svg';
import { ILeafletMapConfig } from 'components/UI/LeafletMap/useLeaflet';

// typings
import { LatLngTuple } from 'leaflet';
import { GeoJSONLayer, Point } from 'components/UI/LeafletMap/typings';
import useMapConfig from 'modules/commercial/custom_maps/api/map_config/useMapConfig';

interface Props {
  onLeafletConfigChange: (newLeafletConfig: ILeafletMapConfig) => void;
  projectId?: string;
  centerLatLng?: LatLngTuple;
  zoomLevel?: number;
  points?: Point[];
}

const LeafletConfig = memo<Props>(
  ({ onLeafletConfigChange, projectId, centerLatLng, zoomLevel, points }) => {
    const localize = useLocalize();

    const {
      data: mapConfig,
      isLoading: isLoadingMapConfig,
      fetchStatus: mapConfigFetchStatus,
    } = useMapConfig(projectId);
    const { data: appConfig, isLoading } = useAppConfiguration();

    // We check for the mapConfigFetchStatus because the query could be disabled if projectId is not provided
    const loading =
      isLoading || (isLoadingMapConfig && mapConfigFetchStatus !== 'idle');

    const center = useMemo(() => {
      if (loading) return;
      return getCenter(centerLatLng, appConfig?.data, mapConfig?.data);
    }, [loading, centerLatLng, appConfig, mapConfig]);

    const zoom = useMemo(() => {
      if (loading) return;
      return getZoomLevel(zoomLevel, appConfig?.data, mapConfig?.data);
    }, [loading, zoomLevel, appConfig, mapConfig]);

    const tileProvider = useMemo(() => {
      if (loading) return;
      return getTileProvider(appConfig?.data, mapConfig?.data);
    }, [loading, appConfig, mapConfig]);

    const tileOptions = useMemo(() => {
      if (!tileProvider) return;
      return getTileOptions(tileProvider);
    }, [tileProvider]);

    const geoJsonLayers = useMemo(() => {
      if (!mapConfig) {
        return [];
      }

      return mapConfig?.data?.attributes?.layers as GeoJSONLayer[];
    }, [mapConfig]);

    const layerMarker = useCallback(
      (geojsonLayer: GeoJSONLayer, _latlng: L.LatLng) => {
        return geojsonLayer.marker_svg_url || legendMarkerIcon;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [geoJsonLayers]
    );

    const layerTooltip = useCallback(
      (_layer: L.GeoJSON, feature: GeoJSON.Feature) => {
        return localize(feature?.properties?.tooltipContent);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [geoJsonLayers]
    );

    const layerPopup = useCallback(
      (_layer: L.GeoJSON, feature: GeoJSON.Feature) => {
        return localize(feature?.properties?.popupContent);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [geoJsonLayers]
    );

    const layerOverlay = useCallback(
      (geojsonLayer: GeoJSONLayer) => {
        return localize(geojsonLayer.title_multiloc);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [geoJsonLayers]
    );

    useEffect(() => {
      if (!center || !zoom || !tileProvider || !tileOptions) return;

      onLeafletConfigChange({
        geoJsonLayers,
        points,
        zoom,
        center,
        tileProvider,
        tileOptions,
        layerMarker,
        layerTooltip,
        layerPopup,
        layerOverlay,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      geoJsonLayers,
      points,
      zoom,
      center,
      tileProvider,
      tileOptions,
      layerMarker,
      layerTooltip,
      layerPopup,
      layerOverlay,
    ]);

    return null;
  }
);

export default LeafletConfig;
