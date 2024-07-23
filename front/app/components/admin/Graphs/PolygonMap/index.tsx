import React, { useState, useMemo, useEffect } from 'react';

import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';

interface Props {
  polygons: GeoJSON.Polygon[];
  layerTitle: string;
  mapConfig?: IMapConfig;
  layerId?: string;
  onInit?: (mapView: MapView) => void;
}

const PolygonMap = ({
  polygons,
  mapConfig,
  layerTitle,
  layerId,
  onInit,
}: Props) => {
  const localize = useLocalize();
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Get layers from mapConfig
  const mapConfigLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [mapConfig, localize]);

  // Create a point graphics list from question responses
  const graphics = useMemo(() => {
    return polygons.map((polygon) => {
      const linePath = polygon.coordinates[0].map((coordinates) => [
        coordinates[0],
        coordinates[1],
      ]);

      return new Graphic({
        geometry: new Polyline({
          paths: [linePath],
        }),
      });
    });
  }, [polygons]);

  // Create an Esri feature layer from the responses list so we can use it to create a heat map
  const responsesLayer = useMemo(() => {
    return new FeatureLayer({
      source: graphics,
      title: layerTitle,
      id: layerId ?? 'responsesLayer',
      objectIdField: 'ID',
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: transparentize(0.5, colors.primary),
          outline: {
            color: colors.primary,
            width: 1,
          },
        }),
      }),
      fields: [
        {
          name: 'ID',
          type: 'oid',
        },
      ],
    });
  }, [graphics, layerId, layerTitle]);

  const layers = useMemo(() => {
    return responsesLayer && mapConfigLayers
      ? [...mapConfigLayers, responsesLayer]
      : [];
  }, [responsesLayer, mapConfigLayers]);

  const initialData = useMemo(
    () => ({
      onInit: (mapView: MapView) => {
        setMapView(mapView);
        onInit?.(mapView);
      },
      showLegend: true,
      showLayerVisibilityControl: true,
      zoom: Number(mapConfig?.data?.attributes.zoom_level),
      center: mapConfig?.data?.attributes.center_geojson,
    }),
    [mapConfig, onInit]
  );

  useEffect(() => {
    if (!mapView) return;
  }, [mapView, responsesLayer]);

  useEffect(() => {
    if (!mapView) return;
    if (!mapView.ready) return;
  }, [mapView, responsesLayer]);

  return (
    <EsriMap
      initialData={initialData}
      webMapId={mapConfig?.data?.attributes.esri_web_map_id}
      height="440px"
      layers={layers}
    />
  );
};

export default PolygonMap;
