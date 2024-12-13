import MapView from '@arcgis/core/views/MapView';

import {
  newPinPointGraphic,
  addPointGraphicToMap,
  goToMapLocation,
  esriPointToGeoJson,
} from 'components/EsriMap/utils';
import { FormData } from 'components/Form/typings';
import { Option } from 'components/UI/LocationInput';

import { projectPointToWebMercator } from 'utils/mapUtils/map';

import { reverseGeocodeAndSave } from './utils';

// handleMapClickPoint
// Description: Handles map click for Point input
export const handleMapClickPoint = (
  event: any,
  mapView: MapView,
  handlePointChange: (point: GeoJSON.Point | undefined) => void | undefined
) => {
  // Center the clicked location on the map
  goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
    // Project the point to Web Mercator, in case the map is using a different projection
    const projectedPoint = projectPointToWebMercator(event.mapPoint);

    // Update the form data
    handlePointChange(esriPointToGeoJson(projectedPoint));
  });
};

// updatePointDataAndDisplay
// Description: Handles the change of the point data
export const updatePointDataAndDisplay = ({
  data,
  locale,
  mapView,
  tenantPrimaryColor,
  setAddress,
}: UpdatePointDataAndDisplayProps) => {
  const point = data as GeoJSON.Point;
  // Set the address to the geocoded location
  reverseGeocodeAndSave(point, locale, setAddress);
  // Create a graphic and add the point and symbol to it
  const graphic = newPinPointGraphic(point, tenantPrimaryColor);
  // Add a pin to the clicked location and delete any existing one
  if (mapView) {
    addPointGraphicToMap(point, mapView, graphic);
  }
};

type UpdatePointDataAndDisplayProps = {
  data: FormData;
  locale: string;
  mapView: MapView | null | undefined;
  setAddress?: (address: Option) => void;
  tenantPrimaryColor: string;
};

// clearPointData
// Description: Clears the point data
export const clearPointData = (
  mapView: MapView | null | undefined,
  setAddress?: (value: React.SetStateAction<Option>) => void
) => {
  setAddress &&
    setAddress({
      value: '',
      label: '',
    });
  mapView?.graphics.removeAll();
};
