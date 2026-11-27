import React, { useCallback, useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Icon,
  Label,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import useLocalize from 'hooks/useLocalize';

import { goToMapLocation, parseLayers } from 'components/EsriMap/utils';
import Error, { TFieldName } from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import DesktopTabletView from './Desktop/DesktopTabletView';
import getInstructionMessage from './getInstructionMessage';
import MobileView from './Mobile/MobileView';
import {
  convertCoordinatesToGeoJSON,
  convertGeojsonToWKT,
  convertWKTToGeojson,
  exceedsPinLimit,
  getCoordinatesFromMultiPointData,
  isAnswerFull,
  removePinAt,
} from './multiPointUtils';

const MapField = ({
  question,
  projectId,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField & {
    input_type: 'point' | 'polygon' | 'line' | 'multipoint';
  };
  projectId?: string;
  scrollErrorIntoView?: boolean;
}) => {
  const name = question.key;
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const {
    formState: { errors: formContextErrors },
    control,
    setValue,
    watch,
    getValues,
  } = useFormContext();

  useEffect(() => {
    if (typeof getValues(name) === 'object') {
      // If the value is an object, it means it has been converted from WKT to GeoJSON
      // We need to convert it back to WKT for the form state
      const convertedValue = convertGeojsonToWKT({ field: getValues(name) });
      setValue(name, convertedValue.field, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [getValues, name, setValue]);

  const value = watch(name)
    ? convertWKTToGeojson({ point: watch(name) }).point
    : undefined;

  const maxPins = question.maximum_select_count;
  const pinCoordinates: number[][] =
    getCoordinatesFromMultiPointData(value, question.input_type) ?? [];
  const limitReached = isAnswerFull(pinCoordinates.length, maxPins);

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;
  const requiredError = errors?.type === 'required';

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  const isMobileOrSmaller = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');

  // State variables
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Get map configuration to use for this question
  const { data: customMapConfig, isLoading: isLoadingMapConfig } =
    useMapConfigById(question.map_config_id);
  const { data: projectMapConfig } = useProjectMapConfig(projectId);

  // If we dont have a custom map config, fall back to the project map config
  const mapConfig = question.map_config_id ? customMapConfig : projectMapConfig;

  // Create map layers from map configuration to load in
  const mapLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

  // On mapInit, persist the mapView in state
  const onMapInit = useCallback((mapView: MapView) => {
    setMapView(mapView);
  }, []);

  // Handler for when single point data changes
  const handleSinglePointChange = useCallback(
    (point?: GeoJSON.Point) => {
      const covertedPoint = convertGeojsonToWKT({ point });
      setValue(name, covertedPoint.point, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue, name]
  );

  const writePinCoordinates = useCallback(
    (coordinates?: number[][]) => {
      if (coordinates) {
        const value = convertCoordinatesToGeoJSON(
          coordinates,
          question.input_type
        );
        const covertedField = convertGeojsonToWKT({ value });
        setValue(name, covertedField.value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      } else {
        setValue(name, undefined, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    },
    [setValue, name, question.input_type]
  );

  // Handler for when multiple point data changes (line/polygon/multipoint)
  const handleMultiPointChange = useCallback(
    (coordinates?: number[][]) => {
      // The map and the drag only ever add a point or move one, so a count
      // past the limit here is an addition to refuse. Taking a pin off goes
      // through writePinCoordinates, which lets an answer that is already
      // over the limit come back down.
      if (coordinates && exceedsPinLimit(coordinates.length, maxPins)) {
        return;
      }

      writePinCoordinates(coordinates);
    },
    [writePinCoordinates, maxPins]
  );

  // The answer as it stands right now, rather than as it stood when a handler
  // was created: an address lookup resolves long after that, and the map may
  // have gained a pin in between.
  const getCurrentPinCoordinates = (): number[][] => {
    const storedValue = getValues(name);
    const geojson = storedValue
      ? convertWKTToGeojson({ point: storedValue }).point
      : undefined;

    return getCoordinatesFromMultiPointData(geojson, question.input_type) ?? [];
  };

  const handleAddPin = (point: GeoJSON.Point) => {
    handleMultiPointChange([...getCurrentPinCoordinates(), point.coordinates]);
    if (mapView) {
      goToMapLocation(point, mapView);
    }
  };

  const handleReplacePin = (index: number, point: GeoJSON.Point) => {
    // The count does not change, so this never has to pass the limit check.
    writePinCoordinates(
      getCurrentPinCoordinates().map((coordinates, pinIndex) =>
        pinIndex === index ? point.coordinates : coordinates
      )
    );
    if (mapView) {
      goToMapLocation(point, mapView);
    }
  };

  const handleRemovePin = (index: number) => {
    writePinCoordinates(removePinAt(getCurrentPinCoordinates(), index));
  };

  const instructionMessage = getInstructionMessage({
    inputType: question.input_type,
    maxPins,
    limitReached,
    // The address rows live in the desktop and tablet view
    hasAddressRows: !isMobileOrSmaller,
    isTabletOrSmaller,
  });
  // Only the messages that name a number of locations are picked when there is
  // a limit to name.
  const instructionText = maxPins
    ? formatMessage(instructionMessage, { maxPins })
    : formatMessage(instructionMessage);

  return (
    <>
      <Box>
        <Label>
          <Box display="flex">
            <Icon name="info-outline" fill={colors.coolGrey600} mr="4px" />
            <Box my="auto">{instructionText}</Box>
          </Box>
        </Label>
      </Box>
      {isLoadingMapConfig && question.map_config_id && <Spinner />}
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={requiredError ? scrollErrorIntoView : false}
        />
      )}
      <Controller
        name={name}
        control={control}
        render={() => (
          <>
            {isMobileOrSmaller ? (
              <MobileView
                mapConfig={mapConfig}
                onMapInit={onMapInit}
                mapView={mapView}
                handleSinglePointChange={handleSinglePointChange}
                handleMultiPointChange={handleMultiPointChange}
                inputType={question.input_type}
                data={value}
                maxPins={maxPins}
              />
            ) : (
              <DesktopTabletView
                mapConfig={mapConfig}
                mapLayers={mapLayers}
                inputType={question.input_type}
                onMapInit={onMapInit}
                mapView={mapView}
                handleSinglePointChange={handleSinglePointChange}
                data={value}
                handleMultiPointChange={handleMultiPointChange}
                pinCoordinates={pinCoordinates}
                maxPins={maxPins}
                onAddPin={handleAddPin}
                onReplacePin={handleReplacePin}
                onRemovePin={handleRemovePin}
              />
            )}
          </>
        )}
      />
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};
export default MapField;
