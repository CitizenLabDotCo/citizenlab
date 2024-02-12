import React, { memo } from 'react';

// components
import EsriMap from 'components/EsriMap';
import { IMapLayerAttributes } from 'modules/commercial/custom_maps/api/map_layers/types';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

export interface Props {
  center?: GeoJSON.Point;
  zoom?: string;
  layers?: IMapLayerAttributes[];
}

const IdeationConfigurationMap = memo<Props>(
  ({ center, zoom, layers }: Props) => {
    // Create GeoJSON layers to add to Esri map
    const geoJsonLayers = layers?.map((layer) => {
      console.log(layer.geojson_file?.url);

      const geojsonLayer = new GeoJSONLayer({
        url: layer.geojson_file?.url,
      });
      return geojsonLayer;
    });

    return (
      <EsriMap
        center={center}
        height={'700px'}
        zoom={Number(zoom)}
        layers={geoJsonLayers}
      />
    );
  }
);

export default IdeationConfigurationMap;
