import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import { JsonSchema } from '@jsonforms/core';

import { IMapConfig } from 'api/map_config/types';

import { FormData } from 'components/Form/typings';
import { customAjv } from 'components/Form/utils';
import { Option } from 'components/UI/LocationInput';

import { geocode, reverseGeocode } from 'utils/locationTools';

import messages from '../messages';

import {
  getCoordinatesFromMultiPointData,
  isLineOrPolygonInput,
  updateMultiPointsDataAndDisplay,
} from './multiPointUtils';
import { updatePointDataAndDisplay } from './pointUtils';

export type MapInputType = 'point' | 'line' | 'polygon';
export const MapInputTypeArray = ['point', 'line', 'polygon'];
export type EsriGeometryType = 'point' | 'polygon' | 'polyline' | 'multipoint';

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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  location?.value &&
    geocode(location.value).then((point) => {
      point && handlePointChange(point);
      return;
    });
};

// getUserInputPoints
// Description: Gets the user input points (as GeoJSON) from a MapView
export const getUserInputPoints = (
  mapView: MapView | null | undefined
): number[][] => {
  const filteredGraphics: Graphic[] = [];

  // We store all user input data in it's own graphics layer
  const userGraphicsLayer = getUserInputGraphicsLayer(mapView);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  data: FormData;
  inputType: MapInputType;
  schema: JsonSchema;
  formatMessage: (message: any, values?: any) => string;
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
  data: FormData;
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
