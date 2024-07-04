import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';

import {
  getMapPinSymbol,
  getShapeSymbol,
  goToMapLocation,
} from 'components/EsriMap/utils';
import { Option } from 'components/UI/LocationInput';

import { geocode, reverseGeocode } from 'utils/locationTools';

// newPointGraphic
// Description: Creates a new point graphic
export const newPointGraphic = (point: GeoJSON.Point, color: string) => {
  return new Graphic({
    geometry: new Point({
      longitude: point.coordinates[0],
      latitude: point.coordinates[1],
    }),
    symbol: getMapPinSymbol({
      color,
      sizeInPx: 44,
    }),
  });
};

// addPointGraphicToMap
// Description: Adds a point graphic to the map
export const addPointGraphicToMap = (
  point: GeoJSON.Point,
  mapView: MapView | null | undefined,
  graphic: Graphic
) => {
  if (mapView) {
    mapView.graphics.removeAll();
    mapView.graphics.add(graphic);
    goToMapLocation(point, mapView);
  }
};

// reverseGeocodeAndSave
// Description: Reverse geocodes a point and saves the address
export const reverseGeocodeAndSave = (
  point: GeoJSON.Point,
  locale: string,
  setAddress?: (address: Option) => void
) => {
  reverseGeocode(point.coordinates[1], point.coordinates[0], locale).then(
    (location) => {
      setAddress &&
        setAddress({
          value: location || '',
          label: location || '',
        });
    }
  );
};

// geocodeAndSaveLocation
// Description: Geocodes a location and saves the point
export const geocodeAndSaveLocation = (
  location: Option,
  handlePointChange: (point: GeoJSON.Point) => void
) => {
  location?.value &&
    geocode(location.value).then((point) => {
      point && handlePointChange(point);
      return;
    });
};

// handleDataPointChange
// Description: Handles the change of the point data
export const handleDataPointChange = ({
  data,
  locale,
  mapView,
  tenantPrimaryColor,
  setAddress,
}: HandleDataPointChangeProps) => {
  const point = data as GeoJSON.Point;
  // Set the address to the geocoded location
  reverseGeocodeAndSave(point, locale, setAddress);
  // Create a graphic and add the point and symbol to it
  const graphic = newPointGraphic(point, tenantPrimaryColor);
  // Add a pin to the clicked location and delete any existing one
  if (mapView) {
    addPointGraphicToMap(point, mapView, graphic);
  }
};

type HandleDataPointChangeProps = {
  data: GeoJSON.Point;
  locale: string;
  mapView: MapView | null | undefined;
  setAddress?: (address: Option) => void;
  tenantPrimaryColor: string;
};

// handleDataLineChange
// Description: Handles the change of the point data
export const handleDataMultipointChange = ({
  data,
  mapView,
  inputType,
  tenantPrimaryColor,
}: HandleDataMultipointChangeProps) => {
  const points = data as GeoJSON.Point[];
  // Create a graphic and add the point and symbol to it
  const graphics = points.map((point) => {
    return new Graphic({
      geometry: new Point({
        longitude: point.coordinates[0],
        latitude: point.coordinates[1],
      }),
      symbol: getShapeSymbol({
        shape: 'circle',
        color: colors.white,
        sizeInPx: 12,
        outlineColor: colors.black,
        outlineWidth: 2,
      }),
    });
  });

  // Create an Esri line graphic connecting the points

  const polyline = new Polyline({
    paths: [
      points.map((point) => [point.coordinates[0], point.coordinates[1]]),
    ],
  });

  const simpleLineSymbol = {
    type: 'simple-line',
    color: colors.black, // Orange
    width: 3,
    style: 'dash',
  };

  const SimpleFillSymbol = {
    type: 'simple-fill',
    color: transparentize(0.7, tenantPrimaryColor),
    outline: {
      color: [0, 0, 0, 0.8],
      width: 2,
      style: 'dash',
    },
  };

  const polylineGraphic = new Graphic({
    geometry: polyline,
    symbol: inputType === 'line' ? simpleLineSymbol : SimpleFillSymbol,
  });

  // Add a pin to the clicked location and delete any existing one
  if (mapView) {
    mapView.graphics.removeAll();
    mapView.graphics.add(polylineGraphic);
    mapView.graphics.addMany(graphics);
  }
};

type HandleDataMultipointChangeProps = {
  data: GeoJSON.Point[];
  mapView: MapView | null | undefined;
  inputType: 'point' | 'line' | 'polygon';
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
