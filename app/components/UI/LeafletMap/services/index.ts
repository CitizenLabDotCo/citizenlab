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

import { addLayersControl, removeControl } from './controls';
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
  removeControl,
  addLayers,
  removeLayers,
  removeLayer,
  addMarkersToMap,
  addClusterGroup,
};
