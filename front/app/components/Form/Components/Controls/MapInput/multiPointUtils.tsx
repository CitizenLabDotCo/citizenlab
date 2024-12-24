// generateLinePreview

import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import MapView from '@arcgis/core/views/MapView';
import { colors } from '@citizenlab/cl2-component-library';
import { ControlElement } from '@jsonforms/core';

import {
  getFillSymbol,
  getLineSymbol,
  getShapeSymbol,
} from 'components/EsriMap/utils';
import { FormData } from 'components/Form/typings';

import { projectPointToWebMercator } from 'utils/mapUtils/map';

import {
  getUserInputGraphicsLayer,
  getUserInputPoints,
  MapInputType,
} from './utils';

// isLineOrPolygonInput
// Description: Checks if the input is a line or polygon
export const isLineOrPolygonInput = (inputType: MapInputType) => {
  return inputType === 'line' || inputType === 'polygon';
};

// handleMapClickMultipoint
// Description: Handles map click for Line or Polygon input
export const handleMapClickMultipoint = (
  event: any,
  mapView: MapView,
  handleMultiPointChange: ((points: number[][] | undefined) => void) | undefined
) => {
  // Project the point to Web Mercator, in case the map is using a different projection
  const projectedPoint = projectPointToWebMercator(event.mapPoint);

  // Add the clicked location to the existing points
  const newPoint = [projectedPoint.longitude, projectedPoint.latitude];
  const currentPointCoordinates = getUserInputPoints(mapView);

  // Update the form data
  currentPointCoordinates.push([newPoint[0], newPoint[1]]);
  handleMultiPointChange?.(currentPointCoordinates);
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

// handlePointDrag
// Description: Handles when a user-added point is then dragged (I.e. edited)
export const setupPointDrag = ({
  mapView,
  handleMultiPointChange,
  pointBeingDragged,
  temporaryDragGraphic,
  tenantSecondaryColor,
  data,
  inputType,
  pointSymbolSize,
}: HandlePointDragProps) => {
  // Using the mapView on 'drag' event, we handle the dragging of the point & updating the form data

  mapView?.on('drag', (event) => {
    if (event.action === 'start') {
      // START ACTION: Store the point that the user is trying to drag

      mapView.hitTest(event).then((response) => {
        // Get the first element under the mouse click
        const clickedElement = response.results[0];
        if (
          clickedElement.layer.title === 'User Input' &&
          clickedElement.type === 'graphic' &&
          clickedElement.graphic.geometry.type === 'point'
        ) {
          event.stopPropagation();
          pointBeingDragged.current = clickedElement.graphic;
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
        temporaryDragGraphic.current = pointBeingDragged.current.clone();

        // Change the symbol colour so we can identify it as the preview point
        temporaryDragGraphic.current.symbol = getShapeSymbol({
          shape: 'circle',
          color: tenantSecondaryColor,
          sizeInPx: pointSymbolSize || 20,
          outlineColor: colors.white,
          outlineWidth: 2,
        });

        // Generate temporary line graphics between the preview point and existing vertices
        generateLinePreview({
          mapView,
          data,
          inputType,
          pointBeingDragged,
          event,
        });

        // Add the preview graphic to the map
        temporaryDragGraphic.current.geometry = mapView.toMap(event);
        mapView.graphics.add(temporaryDragGraphic.current);
      }
    } else if (event.action === 'end') {
      // END ACTION: Update the form data with the new coordinates and remove temporary graphics
      event.stopPropagation();
      if (temporaryDragGraphic.current) {
        // Remove the temporary drag graphic
        mapView.graphics.remove(temporaryDragGraphic.current);

        // Get the original point we dragged and update its geometry (and save the updated data)
        const dataCoordinates = getCoordinatesFromMultiPointData(
          data,
          inputType
        );

        const newData = dataCoordinates?.map((coordinates: number[]) => {
          const longitude = coordinates[0];
          const latitude = coordinates[1];

          if (temporaryDragGraphic.current?.geometry) {
            // Project the point to Web Mercator, in case the map is using a different projection
            const projectedPoint = projectPointToWebMercator(
              temporaryDragGraphic.current.geometry
            );

            if (
              longitude === pointBeingDragged.current?.geometry['longitude'] &&
              latitude === pointBeingDragged.current.geometry['latitude']
            ) {
              // This is the original point the user tried to drag, so
              // now we update the geometry.
              return [projectedPoint['longitude'], projectedPoint['latitude']];
            }
          }

          return coordinates;
        });

        handleMultiPointChange(newData);

        // Reset the variables and remove graphics
        mapView.graphics.removeAll();
        pointBeingDragged.current = null;
        temporaryDragGraphic.current = null;
      }
    }
  });
};

type HandlePointDragProps = {
  mapView: MapView | null | undefined;
  handleMultiPointChange: (points: number[][] | undefined) => void;
  pointBeingDragged: React.MutableRefObject<Graphic | null>;
  temporaryDragGraphic: React.MutableRefObject<Graphic | null>;
  tenantSecondaryColor: string;
  data: FormData;
  inputType: MapInputType;
  pointSymbolSize?: number;
};

// Description: Generates a line preview when dragging a point
export const generateLinePreview = ({
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
      coordinates[0] === pointBeingDragged.current?.geometry['longitude'] &&
      coordinates[1] === pointBeingDragged.current.geometry['latitude']
  );

  // Project the point to Web Mercator, in case the map is using a different projection
  const projectedPoint = projectPointToWebMercator(mapView.toMap(event));

  // Create a line graphic connecting the drag point preview to any previous or next points
  const linePreviewPath: number[][] = [];

  if (
    indexOfDragPoint > 0 &&
    indexOfDragPoint < currentDataCoordinates.length - 1
  ) {
    // Dragging a middle point
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint - 1]);
    linePreviewPath.push([projectedPoint.longitude, projectedPoint.latitude]);
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint + 1]);
  } else if (indexOfDragPoint === 0) {
    // Dragging the first point
    if (inputType === 'polygon') {
      // Connect the line to the last point if we're forming a polygon
      linePreviewPath.push(
        currentDataCoordinates?.[currentDataCoordinates.length - 1]
      );
    }
    linePreviewPath.push([projectedPoint.longitude, projectedPoint.latitude]);

    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint + 1]);
  } else if (indexOfDragPoint === currentDataCoordinates.length - 1) {
    // Dragging the last point
    linePreviewPath.push(currentDataCoordinates?.[indexOfDragPoint - 1]);
    linePreviewPath.push([projectedPoint.longitude, projectedPoint.latitude]);
    if (inputType === 'polygon') {
      // Connect the line to the first point if we're forming a polygon
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
  data: FormData;
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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const pointsForLine = coordinates?.map((coordinates) => [
    coordinates[0],
    coordinates[1],
  ]);
  // If we have a polygon, we want to close the shape by connecting the first and last points
  if (inputType === 'polygon') {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
