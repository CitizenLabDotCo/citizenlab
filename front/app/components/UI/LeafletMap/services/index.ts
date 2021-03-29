import {
  setup,
  init,
  addTileLayer,
  addOnClickHandler,
  changeView,
  addOnMoveHandler,
  addOnZoomHandler,
  refitBounds,
} from './setup';

import { addLayersControl, removeLayersControl } from './controls';
import { addLayers, removeLayers, removeLayer } from './layers';
import { addMarkersToMap, addClusterGroup } from './markers';

export default {
  setup,
  init,
  addTileLayer,
  addOnClickHandler,
  changeView,
  addOnMoveHandler,
  addOnZoomHandler,
  refitBounds,
  addLayersControl,
  removeLayersControl,
  addLayers,
  removeLayers,
  removeLayer,
  addMarkersToMap,
  addClusterGroup,
};
