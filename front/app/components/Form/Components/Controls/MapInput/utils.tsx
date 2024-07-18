import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { JsonSchema } from '@jsonforms/core';

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
    paths: [
      pointsForLine?.map((coordinates) => [coordinates[0], coordinates[1]]),
    ],
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
  inputType: 'point' | 'line' | 'polygon';
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

  // We store all user input data in a graphics layer called 'User Input'
  const userGraphicsLayer = getUserInputGraphicsLayer(mapView);

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
// Description: Gets any nested coordinate errors raised by ajv validation
export const checkCoordinateErrors = ({
  data,
  inputType,
  schema,
  formatMessage,
}: CheckCoordinateErrorsProps) => {
  const validate = customAjv.compile(schema);
  if (inputType === 'line' || inputType === 'polygon') {
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
  inputType: 'point' | 'line' | 'polygon';
  schema: JsonSchema;
  formatMessage: (message: any, values?: any) => string;
};

// getCoordinatesFromMultiPointData
// Description: Gets the coordinates from the data
export const getCoordinatesFromMultiPointData = (
  data: any,
  inputType: 'point' | 'line' | 'polygon'
) => {
  return inputType === 'polygon'
    ? data?.coordinates?.[0]?.slice(0, -1)
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
  } else {
    // We have a line or polygon input
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
  inputType: 'point' | 'line' | 'polygon';
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

// TODO: Clean up!
// handlePointDrag
// Description: Handles when a point a user added to a map is then dragged (edited)
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
  // TODO: Clean up!
  mapView?.on('drag', (evt) => {
    if (evt?.action === 'start') {
      mapView.hitTest(evt).then((resp) => {
        const clickedElement = resp?.results?.[0];
        if (clickedElement) {
          if (
            clickedElement.type === 'graphic' &&
            clickedElement.graphic.geometry.type === 'point'
          ) {
            evt.stopPropagation();
            pointBeingDragged.current = clickedElement?.graphic;
          }
        }
      });
    } else if (evt.action === 'update') {
      if (pointBeingDragged.current) {
        evt.stopPropagation();

        // if there is a tempGraphic, remove it
        if (temporaryDragGraphic.current) {
          mapView.graphics.remove(temporaryDragGraphic.current);
        } else if (pointBeingDragged.current) {
          // if there is no tempGraphic, this is the first update event, so remove original graphic
          mapView.graphics.remove(pointBeingDragged.current);
        }
        // create new temp graphic and add it
        if (pointBeingDragged?.current) {
          temporaryDragGraphic.current = pointBeingDragged?.current?.clone();
          temporaryDragGraphic.current.symbol = getShapeSymbol({
            shape: 'circle',
            color: theme.colors.tenantSecondary,
            sizeInPx: isMobileOrSmaller ? 26 : 20,
            outlineColor: colors.white,
            outlineWidth: 2,
          });
        }

        // get index of draggingGraphic in data
        const dataCoordinates = getCoordinatesFromMultiPointData(
          data,
          inputType
        );
        const indexDragPointInData = dataCoordinates.findIndex(
          (coord) =>
            coord[0] === pointBeingDragged?.current?.geometry?.['longitude']
        );

        // Create a line graphic connecting the indexDragPointInData any any previous or next points

        if (indexDragPointInData !== undefined && indexDragPointInData >= 0) {
          const linePreviewPath: number[][] = [];

          if (inputType === 'polygon' && indexDragPointInData === 0) {
            linePreviewPath.push(dataCoordinates?.[dataCoordinates.length - 1]);
            linePreviewPath.push([
              mapView.toMap(evt).longitude,
              mapView.toMap(evt).latitude,
            ]);
          }

          if (indexDragPointInData > 0) {
            linePreviewPath.push(dataCoordinates?.[indexDragPointInData - 1]);
            linePreviewPath.push([
              mapView.toMap(evt).longitude,
              mapView.toMap(evt).latitude,
            ]);
          }
          if (indexDragPointInData < dataCoordinates.length - 1) {
            linePreviewPath.push(dataCoordinates?.[indexDragPointInData + 1]);
          }

          if (indexDragPointInData === 0 && inputType !== 'polygon') {
            linePreviewPath.push([
              mapView.toMap(evt).longitude,
              mapView.toMap(evt).latitude,
            ]);
            if (dataCoordinates.length > 1) {
              linePreviewPath.push(dataCoordinates?.[indexDragPointInData + 1]);
            }
          }

          if (inputType === 'polygon') {
            if (indexDragPointInData === dataCoordinates.length - 1) {
              linePreviewPath.push(dataCoordinates?.[0]);
            }
          }
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
          mapView.graphics.removeAll();
          mapView.graphics.add(lineGraphic);
        }

        if (temporaryDragGraphic.current) {
          temporaryDragGraphic.current.geometry = mapView.toMap(evt);
          mapView.graphics.add(temporaryDragGraphic.current);
        }
      }
    } else if (evt.action === 'end') {
      // on drag end, continue only if there is a draggingGraphic
      if (pointBeingDragged) {
        evt.stopPropagation();
        // rm temp
        if (temporaryDragGraphic.current) {
          mapView.graphics.remove(temporaryDragGraphic.current);
          // create new graphic based on original dragging graphic
          const newGraphic = pointBeingDragged.current?.clone();
          if (newGraphic && newGraphic.geometry) {
            const newGeometry = temporaryDragGraphic?.current.geometry?.clone();
            if (newGeometry) {
              newGraphic.geometry = newGeometry;
            }
          }

          // Replace graphic from User Input layer with new coordinates
          newGraphic && mapView.graphics.add(newGraphic);

          // Find the data point that corresponds to the dragged point
          getUserInputGraphicsLayer(mapView)?.graphics.forEach((graphic) => {
            if (graphic.geometry === pointBeingDragged.current?.geometry) {
              const newCoordinates = [
                newGraphic?.geometry?.['longitude'],
                newGraphic?.geometry?.['latitude'],
              ];

              if (handleMultiPointChange) {
                const dataCoordinates = getCoordinatesFromMultiPointData(
                  data,
                  inputType
                );

                const newData = dataCoordinates?.map((coord) => {
                  if (
                    coord[0] ===
                    pointBeingDragged?.current?.geometry?.['longitude']
                  ) {
                    return newCoordinates;
                  } else {
                    return coord;
                  }
                });

                handleMultiPointChange(newData);
              }
            }
          });

          // reset vars
          mapView.graphics.removeAll();
          pointBeingDragged.current = null;
          temporaryDragGraphic.current = null;
          // set cursor to pointer
          mapView.container.style.cursor = 'pointer';
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
  inputType: 'point' | 'line' | 'polygon';
  isMobileOrSmaller?: boolean;
};
