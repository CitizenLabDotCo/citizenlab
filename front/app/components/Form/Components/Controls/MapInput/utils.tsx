import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { ControlElement, JsonSchema } from '@jsonforms/core';

import { IMapConfig } from 'api/map_config/types';

import {
  esriPointToGeoJson,
  getFillSymbol,
  getLineSymbol,
  getMapPinSymbol,
  getShapeSymbol,
  goToMapLocation,
} from 'components/EsriMap/utils';
import { customAjv } from 'components/Form/utils';
import { Option } from 'components/UI/LocationInput';

import { geocode, reverseGeocode } from 'utils/locationTools';

import messages from '../messages';

export type MapInputType = 'point' | 'line' | 'polygon';

// isLineOrPolygonInput
// Description: Checks if the input is a line or polygon
export const isLineOrPolygonInput = (inputType: MapInputType) => {
  return inputType === 'line' || inputType === 'polygon';
};

// newPointGraphic
// Description: Creates a new point (pin symbol) graphic
export const newPinPointGraphic = (point: GeoJSON.Point, color: string) => {
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
    // Add to existing points
    currentPointCoordinates.push([newPoint[0], newPoint[1]]);
    handleMultiPointChange?.(currentPointCoordinates);
  } else {
    // This is the user's first point
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
  const graphic = newPinPointGraphic(point, tenantPrimaryColor);
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
// Description: Handles when multipoint (E.g. Line/Polygon) data changes
export const updateMultiPointsDataAndDisplay = ({
  data,
  mapView,
  inputType,
  tenantPrimaryColor,
  isMobileOrSmaller,
}: UpdateMultiPointsDataAndDisplayProps) => {
  const coordinates = data;

  // Create graphics for the user input points
  const pointGraphics = coordinates?.map((coordinates) => {
    return new Graphic({
      geometry: new Point({
        longitude: coordinates[0],
        latitude: coordinates[1],
      }),
      symbol: getShapeSymbol({
        shape: 'circle',
        color: tenantPrimaryColor,
        sizeInPx: isMobileOrSmaller ? 26 : 20,
        outlineColor: colors.white,
        outlineWidth: 2,
      }),
    });
  });

  // Create an Esri line graphic to connect the points
  const pointsForLine = coordinates?.map((coordinates) => [
    coordinates[0],
    coordinates[1],
  ]);
  // If we have a polygon, we want to close the shape by connecting the first and last points
  if (inputType === 'polygon') {
    pointsForLine?.push(coordinates[0]);
  }
  // Create the Esri line object
  const polyline = new Polyline({
    paths: [pointsForLine],
  });

  // Create the line graphic
  const lineGraphic = new Graphic({
    geometry: polyline,
    symbol:
      inputType === 'line'
        ? getLineSymbol({ style: 'dash' })
        : getFillSymbol({
            // Fills a polygon
            transparency: 0.3,
            color: tenantPrimaryColor,
            outlineStyle: 'dash',
          }),
  });

  // Add the point and line graphics to the map
  if (mapView) {
    // Remove any existing user input graphics
    const userInputLayer = getUserInputGraphicsLayer(mapView);

    if (userInputLayer) {
      userInputLayer.removeAll();
      userInputLayer.add(lineGraphic);
      userInputLayer.addMany(pointGraphics);
    } else {
      // Add a new graphics layer to store the user inputs
      const graphicsLayer = new GraphicsLayer({ title: 'User Input' });
      graphicsLayer.add(lineGraphic);
      graphicsLayer.addMany(pointGraphics);
      mapView.map.add(graphicsLayer);
    }
  }
};

type UpdateMultiPointsDataAndDisplayProps = {
  data: number[][];
  mapView: MapView | null | undefined;
  inputType: MapInputType;
  tenantPrimaryColor: string;
  zoomToInputExtent?: boolean;
  isMobileOrSmaller?: boolean;
};

// getUserInputPoints
// Description: Gets the user input points (as GeoJSON) from a MapView
export const getUserInputPoints = (
  mapView: MapView | null | undefined
): number[][] => {
  const filteredGraphics: Graphic[] = [];

  // We store all user input data in it's own graphics layer
  const userGraphicsLayer = getUserInputGraphicsLayer(mapView);

  userGraphicsLayer?.graphics?.forEach((graphic) => {
    if (graphic.geometry.type === 'point') {
      // We want just a list of the points
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
// Description: Gets any nested coordinate errors raised by ajv validation.
// Given the nested structure of the JSON schema for GeoJSON data, we need to check validity here.
export const checkCoordinateErrors = ({
  data,
  inputType,
  schema,
  formatMessage,
}: CheckCoordinateErrorsProps) => {
  const validate = customAjv.compile(schema);
  if (isLineOrPolygonInput(inputType)) {
    if (!validate(data)) {
      if (validate.errors) {
        for (const err of validate.errors) {
          if (err.keyword === 'minItems') {
            return formatMessage(messages.minimumCoordinates, {
              numPoints: inputType === 'line' ? 2 : 3,
            });
          }
        }
      }
    }
  }
  return '';
};

type CheckCoordinateErrorsProps = {
  data: any;
  inputType: MapInputType;
  schema: JsonSchema;
  formatMessage: (message: any, values?: any) => string;
};

// getCoordinatesFromMultiPointData
// Description: Gets the coordinates from the data
export const getCoordinatesFromMultiPointData = (
  data: any,
  inputType: MapInputType
) => {
  return inputType === 'polygon'
    ? data?.coordinates?.[0]?.slice(0, -1) // If polygon, remove the last point (a duplicated first point to close the shape)
    : data?.coordinates;
};

// updateDataAndDisplay
// Description: Updates the data and display
export const updateDataAndDisplay = ({
  data,
  mapView,
  inputType,
  locale,
  theme,
  setAddress,
  isMobileOrSmaller,
}: UpdateDataAndDisplayProps) => {
  if (inputType === 'point') {
    updatePointDataAndDisplay({
      data,
      mapView,
      locale,
      tenantPrimaryColor: theme.colors.tenantPrimary,
      setAddress,
    });
  } else if (isLineOrPolygonInput(inputType)) {
    updateMultiPointsDataAndDisplay({
      data: getCoordinatesFromMultiPointData(data, inputType),
      mapView,
      inputType,
      tenantPrimaryColor: theme.colors.tenantPrimary,
      isMobileOrSmaller,
    });
  }
};

type UpdateDataAndDisplayProps = {
  data: any;
  mapView: MapView | null | undefined;
  inputType: MapInputType;
  locale: string;
  theme: any;
  setAddress?: (address: Option) => void;
  isMobileOrSmaller?: boolean;
};

// getUserInputGraphicsLayer
// Description: Gets the user input graphics layer
export const getUserInputGraphicsLayer = (mapView?: MapView | null) => {
  if (mapView) {
    return mapView?.map?.layers?.find(
      (layer) => layer.title === 'User Input'
    ) as GraphicsLayer;
  }
  return;
};

// getInitialMapCenter
// Description: Gets the initial map center when loading the map.
export const getInitialMapCenter = (
  inputType: MapInputType,
  mapConfig: IMapConfig | undefined,
  data: any
) => {
  if (inputType === 'point') {
    return data || mapConfig?.data.attributes.center_geojson;
  } else if (isLineOrPolygonInput(inputType)) {
    return mapConfig?.data.attributes.center_geojson;
  }
};

// handlePointDrag
// Description: Handles when a user-added point is then dragged (I.e. edited)
export const handlePointDrag = ({
  mapView,
  handleMultiPointChange,
  pointBeingDragged,
  temporaryDragGraphic,
  theme,
  data,
  inputType,
  isMobileOrSmaller,
}: HandlePointDragProps) => {
  // Using the mapView on 'drag' event, we handle the dragging of the point & updating the form data

  mapView?.on('drag', (event) => {
    if (event?.action === 'start') {
      // START ACTION: Store the point that the user is trying to drag

      mapView.hitTest(event).then((response) => {
        // Get the first element under the mouse click
        const clickedElement = response?.results?.[0];
        if (
          clickedElement?.layer.title === 'User Input' &&
          clickedElement?.type === 'graphic' &&
          clickedElement.graphic.geometry.type === 'point'
        ) {
          event.stopPropagation();
          pointBeingDragged.current = clickedElement?.graphic;
        }
      });
    } else if (event.action === 'update') {
      // UPDATE ACTION: Create temporary graphics to show the drag "preview"

      if (pointBeingDragged.current) {
        event.stopPropagation();

        // Remove any existing temporary graphics
        temporaryDragGraphic.current &&
          mapView.graphics.remove(temporaryDragGraphic.current);

        // Create a temporary "preview" point graphic and add it to the map view
        temporaryDragGraphic.current = pointBeingDragged?.current?.clone();

        // Change the symbol colour so we can identify it as the preview point
        temporaryDragGraphic.current.symbol = getShapeSymbol({
          shape: 'circle',
          color: theme.colors.tenantSecondary,
          sizeInPx: isMobileOrSmaller ? 26 : 20,
          outlineColor: colors.white,
          outlineWidth: 2,
        });

        // Generate temporary line graphics between the preview point and existing vertices
        mapView &&
          generateLinePreview({
            mapView,
            data,
            inputType,
            pointBeingDragged,
            event,
          });

        // Add the preview graphic to the map
        if (temporaryDragGraphic.current) {
          temporaryDragGraphic.current.geometry = mapView.toMap(event);
          mapView.graphics.add(temporaryDragGraphic.current);
        }
      }
    } else if (event.action === 'end') {
      // END ACTION: Update the form data with the new coordinates and remove temporary graphics

      if (pointBeingDragged) {
        event.stopPropagation();
        if (temporaryDragGraphic.current) {
          // Remove the temporary drag graphic
          mapView.graphics.remove(temporaryDragGraphic.current);

          // Get the original point we dragged and update its geometry (and save the updated data)
          const dataCoordinates = getCoordinatesFromMultiPointData(
            data,
            inputType
          );

          const newData = dataCoordinates?.map((coordinates: number[][]) => {
            const longitude = coordinates[0];
            const latitude = coordinates[1];
            if (
              longitude ===
                pointBeingDragged?.current?.geometry?.['longitude'] &&
              latitude === pointBeingDragged?.current?.geometry?.['latitude']
            ) {
              // This is the original point the user tried to drag, so
              // now we update the geometry.
              return [
                temporaryDragGraphic?.current?.geometry?.['longitude'],
                temporaryDragGraphic?.current?.geometry?.['latitude'],
              ];
            } else {
              return coordinates;
            }
          });

          handleMultiPointChange && handleMultiPointChange(newData);

          // Reset the variables and remove graphics
          mapView.graphics.removeAll();
          pointBeingDragged.current = null;
          temporaryDragGraphic.current = null;
        }
      }
    }
  });
};

type HandlePointDragProps = {
  mapView: MapView | null | undefined;
  handleMultiPointChange:
    | ((points: number[][] | undefined) => void)
    | undefined;
  pointBeingDragged: React.MutableRefObject<Graphic | null>;
  temporaryDragGraphic: React.MutableRefObject<Graphic | null>;
  theme: any;
  data: any;
  inputType: MapInputType;
  isMobileOrSmaller?: boolean;
};

// generateLinePreview
// Description: Generates a line preview when dragging a point
const generateLinePreview = ({
  data,
  inputType,
  pointBeingDragged,
  mapView,
  event,
}: GenerateLinePreviewProps) => {
  // Determine the index of the point the user is trying to drag
  const currentDataCoordinates = getCoordinatesFromMultiPointData(
    data,
    inputType
  );

  // If we only have 1 current point, we don't need to draw any lines
  if (currentDataCoordinates?.length === 1) {
    return;
  }

  const indexOfDragPoint = currentDataCoordinates.findIndex(
    (coordinates: number[][]) =>
      coordinates[0] === pointBeingDragged?.current?.geometry?.['longitude'] &&
      coordinates[1] === pointBeingDragged?.current?.geometry?.['latitude']
  );

  // Create a line graphic connecting the indexDragPointInData any any previous or next points
  const linePreviewPath: number[][] = [];

  if (
    indexOfDragPoint > 0 &&
    indexOfDragPoint < currentDataCoordinates.length - 1
  ) {
    // Dragging a middle point
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint - 1]);
    linePreviewPath.push([
      mapView.toMap(event).longitude,
      mapView.toMap(event).latitude,
    ]);
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint + 1]);
  } else if (indexOfDragPoint === 0) {
    // Dragging the first point
    if (inputType === 'polygon') {
      linePreviewPath.push(
        currentDataCoordinates?.[currentDataCoordinates.length - 1]
      );
    }
    linePreviewPath.push([
      mapView.toMap(event).longitude,
      mapView.toMap(event).latitude,
    ]);

    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint + 1]);
  } else if (indexOfDragPoint === currentDataCoordinates.length - 1) {
    // Dragging the last point
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint - 1]);
    linePreviewPath.push([
      mapView.toMap(event).longitude,
      mapView.toMap(event).latitude,
    ]);
    if (inputType === 'polygon') {
      linePreviewPath.push(currentDataCoordinates?.[0]);
    }
  }

  // Create the Line graphic
  const lineGraphic = new Graphic({
    geometry: new Polyline({
      paths: [linePreviewPath],
    }),
    symbol: new SimpleLineSymbol({
      color: [0, 0, 0, 0.5],
      width: 2,
      style: 'dash',
    }),
  });

  // Add it to the map
  mapView.graphics.removeAll();
  mapView.graphics.add(lineGraphic);
};

type GenerateLinePreviewProps = {
  mapView: MapView;
  data: any;
  inputType: MapInputType;
  pointBeingDragged: React.MutableRefObject<Graphic | null>;
  event: any;
};

// convertCoordinatesToGeoJSON
// Description: Converts array of coordinates to GeoJSON LineString or Polygon
export const convertCoordinatesToGeoJSON = (
  coordinates: number[][],
  uiSchema: ControlElement
) => {
  if (coordinates) {
    const geoJsonType =
      uiSchema.options?.input_type === 'line' ? 'LineString' : 'Polygon';

    // Add an extra coordinate to close the line if we're forming a polygon
    geoJsonType === 'Polygon' && coordinates.push(coordinates[0]);

    // Return the GeoJSON object
    return {
      type: geoJsonType,
      // Polygons use a double-nested array structure, so we wrap the coordinates in an additional array if needed
      coordinates: geoJsonType === 'LineString' ? coordinates : [coordinates],
    };
  }

  return;
};
