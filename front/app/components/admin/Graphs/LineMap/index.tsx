import React, { useMemo } from 'react';

import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import { IMapConfig } from 'api/map_config/types';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';

interface Props {
  lines: GeoJSON.LineString[];
  layerTitle: string;
  mapConfig?: IMapConfig;
  layerId?: string;
  onInit?: (mapView: MapView) => void;
}

const LineMap = ({ lines, mapConfig, layerTitle, layerId, onInit }: Props) => {
  const localize = useLocalize();

  // Get layers from mapConfig
  const mapConfigLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [mapConfig, localize]);

  // Create a point graphics list from question responses
  const graphics = useMemo(() => {
    return lines.map((line) => {
      const linePath = line.coordinates.map((coordinates) => [
        coordinates[0],
        coordinates[1],
      ]);

      return new Graphic({
        geometry: new Polyline({
          paths: [linePath],
        }),
      });
    });
  }, [lines]);

  // Create an Esri feature layer from the responses list
  const responsesLayer = useMemo(() => {
    return new FeatureLayer({
      source: graphics,
      title: layerTitle,
      id: layerId ?? 'responsesLayer',
      objectIdField: 'ID',
      renderer: new SimpleRenderer({
        symbol: new SimpleLineSymbol({
          color: transparentize(0.5, colors.primary),
          width: 4,
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return responsesLayer && mapConfigLayers
      ? [...mapConfigLayers, responsesLayer]
      : [];
  }, [responsesLayer, mapConfigLayers]);

  const initialData = useMemo(
    () => ({
      onInit: (mapView: MapView) => {
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

export default LineMap;
