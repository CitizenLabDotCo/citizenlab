import { IMapLayerAttributes } from 'api/map_layers/types';

export interface IMapLayerAttributesWithOrdering extends IMapLayerAttributes {
  attributes: {
    ordering: number;
  };
}

export default (mapLayers: IMapLayerAttributes[]) => {
  const mapLayersWithOrdering: IMapLayerAttributesWithOrdering[] = [];

  for (let i = 0; i < mapLayers.length; i++) {
    const {
      id,
      title_multiloc,
      geojson,
      default_enabled,
      geojson_file,
      marker_svg_url,
      type,
    } = mapLayers[i];

    mapLayersWithOrdering.push({
      id,
      title_multiloc,
      geojson,
      default_enabled,
      geojson_file,
      marker_svg_url,
      type,
      attributes: {
        ordering: i,
      },
    });
  }

  return mapLayersWithOrdering;
};
