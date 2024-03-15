import React, { useState, useMemo, useEffect } from 'react';

import { when as reactiveUtilsWhen } from '@arcgis/core/core/reactiveUtils.js';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { applyHeatMapRenderer, parseLayers } from 'components/EsriMap/utils';

interface Props {
  points: GeoJSON.Point[];
  layerTitle: string;
  mapConfig?: IMapConfig;
  layerId?: string;
  heatmap?: boolean;
  onInit?: (mapView: MapView) => void;
}

const circleSymbol = new SimpleMarkerSymbol({
  color: colors.primary,
  style: 'circle',
  size: '18px',
  outline: {
    color: colors.white,
    width: 2,
  },
});

const PointMap = ({
  points,
  mapConfig,
  layerTitle,
  layerId,
  heatmap = false,
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
    return points.map(({ coordinates }) => {
      return new Graphic({
        geometry: new Point({
          longitude: coordinates?.[0],
          latitude: coordinates?.[1],
        }),
      });
    });
  }, [points]);

  // Create an Esri feature layer from the responses list so we can use it to create a heat map
  const responsesLayer = useMemo(() => {
    return new FeatureLayer({
      source: graphics,
      title: layerTitle,
      id: layerId ?? 'responsesLayer',
      objectIdField: 'ID',
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
    if (responsesLayer.renderer) return;

    // Set initial renderer when map is ready
    const handle = reactiveUtilsWhen(
      () => mapView?.ready === true,
      () => {
        if (heatmap) {
          applyHeatMapRenderer(responsesLayer, mapView);
        } else {
          responsesLayer.renderer = new Renderer({
            symbol: circleSymbol,
          });
        }
      }
    );

    return () => handle.remove();
  }, [mapView, heatmap, responsesLayer]);

  useEffect(() => {
    if (!mapView) return;
    if (!responsesLayer.renderer) return;

    const isCurrentlyHeatmap = responsesLayer.renderer.type === 'heatmap';

    // Handle updates to heatmap variable
    if (heatmap && !isCurrentlyHeatmap) {
      applyHeatMapRenderer(responsesLayer, mapView);
    } else if (!heatmap && isCurrentlyHeatmap) {
      responsesLayer.renderer = new Renderer({
        symbol: circleSymbol,
      });
    }
  }, [mapView, responsesLayer, heatmap]);

  useEffect(() => {
    if (!mapView) return;

    // Update heatmap when map extent changes
    const handle = reactiveUtilsWhen(
      () => mapView?.stationary === true,
      () => {
        if (mapView?.extent && responsesLayer.renderer?.type === 'heatmap') {
          applyHeatMapRenderer(responsesLayer, mapView);
        }
      }
    );

    return () => handle.remove();
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

export default PointMap;
