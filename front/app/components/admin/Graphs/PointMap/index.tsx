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
      // Set the symbol used to render the graphics
      renderer: new Renderer({
        symbol: circleSymbol,
      }),
    });
  }, [graphics, layerId, layerTitle]);

  const layers = useMemo(() => {
    return responsesLayer && mapConfigLayers
      ? [...mapConfigLayers, responsesLayer]
      : [];
  }, [responsesLayer, mapConfigLayers]);

  const initialData = useMemo(
    () => ({
      onInit: setMapView,
      showLegend: true,
      showLayerVisibilityControl: true,
      zoom: Number(mapConfig?.data.attributes.zoom_level),
      center: mapConfig?.data.attributes.center_geojson,
    }),
    [mapConfig]
  );

  useEffect(() => {
    if (!mapView) return;

    if (heatmap) {
      applyHeatMapRenderer(responsesLayer, mapView);
    } else {
      responsesLayer.renderer = new Renderer({
        symbol: circleSymbol,
      });
    }
  }, [mapView, heatmap, responsesLayer]);

  useEffect(() => {
    reactiveUtilsWhen(
      () => mapView?.stationary === true,
      () => {
        if (mapView?.extent && responsesLayer?.renderer.type === 'heatmap') {
          applyHeatMapRenderer(responsesLayer, mapView);
        }
      }
    );
  }, [mapView, responsesLayer]);

  return (
    <EsriMap
      initialData={initialData}
      webMapId={mapConfig?.data.attributes.esri_web_map_id}
      height="440px"
      layers={layers}
    />
  );
};

export default PointMap;
