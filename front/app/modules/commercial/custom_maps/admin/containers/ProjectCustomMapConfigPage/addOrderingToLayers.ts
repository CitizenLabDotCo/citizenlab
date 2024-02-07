import { IMapLayerAttributes } from 'modules/commercial/custom_maps/api/map_layers/types';

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
    } = mapLayers[i];

    mapLayersWithOrdering.push({
      type: 'CustomMaps::GeojsonLayer',
      id,
      title_multiloc,
      geojson,
      default_enabled,
      geojson_file,
      marker_svg_url,
      attributes: {
        ordering: i,
      },
    });
  }

  return mapLayersWithOrdering;
};
