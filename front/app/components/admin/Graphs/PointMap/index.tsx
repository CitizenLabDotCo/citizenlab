import React, { useState, useMemo, useEffect } from 'react';

import { when as reactiveUtilsWhen } from '@arcgis/core/core/reactiveUtils.js';
import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { applyHeatMapRenderer, parseLayers } from 'components/EsriMap/utils';

import { applyMapRenderer } from './utils';

interface Props {
  points: GeoJSON.Point[];
  layerTitle: string;
  mapConfig?: IMapConfig;
  layerId?: string;
  heatmap?: boolean;
  onInit?: (mapView: MapView) => void;
}

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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          longitude: coordinates?.[0],
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      showLegendExpanded: false,
      showLayerVisibilityControl: true,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      zoom: Number(mapConfig?.data?.attributes.zoom_level),
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      center: mapConfig?.data?.attributes.center_geojson,
    }),
    [mapConfig, onInit]
  );

  useEffect(() => {
    if (!mapView) return;

    // Set initial renderer when map is ready
    const handle = reactiveUtilsWhen(
      () => mapView.ready === true,
      () => {
        applyMapRenderer(responsesLayer, mapView, heatmap);
      }
    );

    return () => handle.remove();
  }, [mapView, heatmap, responsesLayer]);

  useEffect(() => {
    if (!mapView) return;
    if (!mapView.ready) return;

    // Update renderer if heatmap variable changes
    applyMapRenderer(responsesLayer, mapView, heatmap);
  }, [mapView, responsesLayer, heatmap]);

  useEffect(() => {
    if (!mapView) return;

    // Update heatmap when map extent changes
    const handle = reactiveUtilsWhen(
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      () => mapView?.stationary === true,
      () => {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      webMapId={mapConfig?.data?.attributes.esri_web_map_id}
      height="440px"
      layers={layers}
    />
  );
};

export default PointMap;
