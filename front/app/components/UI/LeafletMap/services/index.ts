import { addTileLayer, changeView, init } from './setup';

import { addLayersControl, removeLayersControl } from './controls';
import { addLayers, removeLayer, removeLayers } from './layers';
import {
  addMarkerClusterGroup,
  addMarkersToMap,
  getMarkerIcon,
} from './markers';

export default {
  init,
  addTileLayer,
  changeView,
  addLayersControl,
  removeLayersControl,
  addLayers,
  removeLayers,
  removeLayer,
  addMarkersToMap,
  addMarkerClusterGroup,
  getMarkerIcon,
};
