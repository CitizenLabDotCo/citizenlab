import {
  setup,
  init,
  addTileLayer,
  addOnClickHandler,
  changeView,
  addOnMoveHandler,
  addOnZoomHandler,
} from './setup';

import { addLayersControl, removeLayersControl } from './controls';
import { addLayers, removeLayers, removeLayer } from './layers';
import { addMarkersToMap, addClusterGroup, getMarkerIcon } from './markers';

export default {
  setup,
  init,
  addTileLayer,
  addOnClickHandler,
  changeView,
  addOnMoveHandler,
  addOnZoomHandler,
  addLayersControl,
  removeLayersControl,
  addLayers,
  removeLayers,
  removeLayer,
  addMarkersToMap,
  addClusterGroup,
  getMarkerIcon,
};
