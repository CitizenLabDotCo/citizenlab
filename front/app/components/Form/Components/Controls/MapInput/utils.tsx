import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { JsonSchema } from '@jsonforms/core';
import { DefinedError } from 'ajv';
import { transparentize } from 'polished';

import {
  esriPointToGeoJson,
  getMapPinSymbol,
  getShapeSymbol,
  goToMapLocation,
} from 'components/EsriMap/utils';
import { customAjv } from 'components/Form/utils';
import { Option } from 'components/UI/LocationInput';

import { geocode, reverseGeocode } from 'utils/locationTools';

import messages from '../messages';

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

// handleMapClickPoint
// Description: Handles map click for Point input
export const handleMapClickPoint = (
  event: any,
  mapView: MapView,
  handlePointChange: (point: GeoJSON.Point | undefined) => void | undefined
) => {
  // Center the clicked location on the map
  goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
    // Update the form data
    handlePointChange?.(esriPointToGeoJson(event.mapPoint));
  });
};

// handleMapClickMultipoint
// Description: Handles map click for Line or Polygon input
export const handleMapClickMultipoint = (
  event: any,
  mapView: MapView,
  handleMultiPointChange: ((points: number[][] | undefined) => void) | undefined
) => {
  // Add the clicked location to the existing points
  const newPoint = [event.mapPoint.longitude, event.mapPoint.latitude];
  const currentPointCoordinates = getUserInputPoints(mapView);

  // Update the form data
  if (currentPointCoordinates) {
    currentPointCoordinates.push([newPoint[0], newPoint[1]]);
    handleMultiPointChange?.(currentPointCoordinates);
  } else {
    handleMultiPointChange?.([newPoint[0], newPoint[1]]);
  }
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
  const graphic = newPointGraphic(point, tenantPrimaryColor);
  // Add a pin to the clicked location and delete any existing one
  if (mapView) {
    addPointGraphicToMap(point, mapView, graphic);
  }
};

type UpdatePointDataAndDisplayProps = {
  data: GeoJSON.Point;
  locale: string;
  mapView: MapView | null | undefined;
  setAddress?: (address: Option) => void;
  tenantPrimaryColor: string;
};

// updateMultiPointsDataAndDisplay
// Description: Handles the change of multiple points data
export const updateMultiPointsDataAndDisplay = ({
  data,
  mapView,
  inputType,
  tenantPrimaryColor,
}: UpdateMultiPointsDataAndDisplayProps) => {
  const coordinates = data;

  // Create graphics for the user input points
  const graphics = coordinates?.map((coordinates) => {
    return new Graphic({
      geometry: new Point({
        longitude: coordinates[0],
        latitude: coordinates[1],
      }),
      symbol: getShapeSymbol({
        shape: 'circle',
        color: tenantPrimaryColor,
        sizeInPx: 14,
        outlineColor: colors.white,
        outlineWidth: 2,
      }),
    });
  });

  // Create an Esri line graphic connecting the points
  const pointsForLine = coordinates?.map((coordinates) => [
    coordinates[0],
    coordinates[1],
  ]);
  if (inputType === 'polygon') {
    // If we have a polygon, we want to close the shape
    pointsForLine?.push(coordinates[0]);
  }
  const polyline = new Polyline({
    paths: [
      pointsForLine?.map((coordinates) => [coordinates[0], coordinates[1]]),
    ],
  });

  // Create styles for the line and fill
  const simpleLineSymbol = {
    type: 'simple-line',
    color: colors.black,
    width: 2,
    style: 'dash',
  };

  const SimpleFillSymbol = {
    type: 'simple-fill',
    color: transparentize(0.3, tenantPrimaryColor),
    style: 'diagonal-cross',
    outline: {
      color: [0, 0, 0, 0.8],
      width: 2,
      style: 'dash',
    },
  };

  // Create the line graphic
  const polylineGraphic = new Graphic({
    geometry: polyline,
    symbol: inputType === 'line' ? simpleLineSymbol : SimpleFillSymbol,
  });

  // Add all graphics to the map
  if (mapView) {
    // Remove any existing user input graphics
    const userInputLayer = mapView?.map?.layers?.find(
      (layer) => layer.title === 'User Input'
    ) as GraphicsLayer;

    if (userInputLayer) {
      userInputLayer.removeAll();
      userInputLayer.add(polylineGraphic);
      userInputLayer.addMany(graphics);
    } else {
      // Add new graphics layer
      const graphicsLayer = new GraphicsLayer({ title: 'User Input' });
      graphicsLayer.add(polylineGraphic);
      graphicsLayer.addMany(graphics);
      mapView.map.add(graphicsLayer);

      // If set, zoom to the extent of the user input
      // if (zoomToInputExtent) {
      //   zoomToUserInputExtent(mapView);
      // }
    }
  }
};

type UpdateMultiPointsDataAndDisplayProps = {
  data: number[][];
  mapView: MapView | null | undefined;
  inputType: 'point' | 'line' | 'polygon';
  tenantPrimaryColor: string;
  zoomToInputExtent?: boolean;
};

// getUserInputPoints
// Description: Gets the user input points (as GeoJSON) from a MapView
export const getUserInputPoints = (
  mapView: MapView | null | undefined
): number[][] => {
  const filteredGraphics: Graphic[] = [];

  // We store all user input data in a graphics layer called 'User Input'
  const userGraphicsLayer = mapView?.map.layers.find(
    (layer) => layer.title === 'User Input'
  ) as GraphicsLayer;
  userGraphicsLayer?.graphics?.forEach((graphic) => {
    if (graphic.geometry.type === 'point') {
      // We just want a list of the points
      filteredGraphics.push(graphic);
    }
  });

  return filteredGraphics.map((graphic) => {
    const point = graphic.geometry as __esri.Point;
    return [point.longitude, point.latitude];
  });
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

// checkCoordinateErrors
// Description: Gets any nested coordinate errors raised by ajv
export const checkCoordinateErrors = ({
  data,
  inputType,
  schema,
  formatMessage,
}: CheckCoordinateErrorsProps) => {
  const validate = customAjv.compile(schema);
  if (inputType === 'line' || inputType === 'polygon') {
    if (!validate(data)) {
      for (const err of validate.errors as DefinedError[]) {
        if (err.keyword === 'minItems') {
          return formatMessage(messages.minimumCoordinates, {
            numPoints: inputType === 'line' ? 2 : 3,
          });
        }
      }
    }
  }
  return '';
};

type CheckCoordinateErrorsProps = {
  data: any;
  inputType: 'point' | 'line' | 'polygon';
  schema: JsonSchema;
  formatMessage: (message: any, values?: any) => string;
};

// zoomToUserInputExtent
// Description: Zooms to the given extent
// export const zoomToUserInputExtent = (mapView: MapView | undefined | null) => {
// if (!mapView) {
//   return
// };
// const userInputLayer = mapView.map?.layers?.find(
//   (layer) => layer.title === 'User Input'
// );
// // Get line graphic
// const graphics = (userInputLayer as GraphicsLayer)?.graphics;
// if (graphics?.length && graphics.length > 1) {
//   const extent = graphics.find(
//     (graphic) => graphic.geometry.type === 'polyline'
//   )?.geometry?.extent;
//   if (extent) {
//     mapView.extent = extent;
//     mapView.zoom = mapView.zoom - 1;
//   }
// }
// };
