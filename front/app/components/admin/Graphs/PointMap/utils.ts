import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';

import { applyHeatMapRenderer } from 'components/EsriMap/utils';

const circleSymbol = new SimpleMarkerSymbol({
  color: colors.primary,
  style: 'circle',
  size: '18px',
  outline: {
    color: colors.white,
    width: 2,
  },
});

export const applyMapRenderer = (
  layer: FeatureLayer,
  mapView: MapView,
  showHeatmap: boolean
) => {
  const { renderer } = layer;

  if (renderer) {
    const isHeatmap = renderer.type === 'heatmap';

    // If there is a renderer, and it already is the correct one,
    // no need to do anything
    if (isHeatmap === showHeatmap) return;
  }

  if (showHeatmap) {
    applyHeatMapRenderer(layer, mapView);
  } else {
    layer.renderer = new Renderer({
      symbol: circleSymbol,
    });
  }
};
