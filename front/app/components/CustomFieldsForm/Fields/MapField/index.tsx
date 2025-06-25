import React, { useCallback, useMemo, useState } from 'react';

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
import { useParams } from 'react-router-dom';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import { parseLayers } from 'components/EsriMap/utils';
import Error, { TFieldName } from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import DesktopTabletView from './Desktop/DesktopTabletView';

const MapField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField & { input_type: 'point' | 'polygon' | 'line' };
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
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  const isMobileOrSmaller = useBreakpoint('phone');
  const isTabletOrSmaller = useBreakpoint('tablet');

  // State variables
  const [mapView, setMapView] = useState<MapView | null>(null);

  // Get Project
  const { slug } = useParams() as {
    slug: string;
  };
  const { data: project } = useProjectBySlug(slug);

  // Get map configuration to use for this question
  const { data: customMapConfig, isLoading: isLoadingMapConfig } =
    useMapConfigById(question.map_config_id);
  const { data: projectMapConfig } = useProjectMapConfig(project?.data.id);

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

  const handleChange = (value?: GeoJSON.Point) => {
    setValue(name, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Handler for when single point data changes
  const handleSinglePointChange = useCallback(
    (point?: GeoJSON.Point) => {
      handleChange(point);
    },
    [handleChange]
  );

  // // Handler for when multiple point data changes (line/polygon)
  // const handleMultiPointChange = useCallback(
  //   (coordinates?: number[][]) => {
  //     if (coordinates) {
  //       const geoJSONObject = convertCoordinatesToGeoJSON(
  //         coordinates,
  //         uischema
  //       );
  //       handleChange(path, geoJSONObject);
  //     } else {
  //       handleChange(path, undefined);
  //     }
  //     setDidBlur(true);
  //   },
  //   [handleChange, path, uischema]
  // );

  const getInstructionMessage = () => {
    if (isTabletOrSmaller) {
      return question.input_type === 'point'
        ? formatMessage(messages.tapOnMapToAddOrType)
        : formatMessage(messages.tapOnMapMultipleToAdd);
    } else {
      return question.input_type === 'point'
        ? formatMessage(messages.clickOnMapToAddOrType)
        : formatMessage(messages.clickOnMapMultipleToAdd);
    }
  };

  return (
    <>
      <Box>
        <Label>
          <Box display="flex">
            <Icon name="info-outline" fill={colors.coolGrey600} mr="4px" />
            <Box my="auto">{getInstructionMessage()}</Box>
          </Box>
        </Label>
      </Box>
      {isLoadingMapConfig && question.map_config_id && <Spinner />}
      {isMobileOrSmaller ? null : (
        // <MobileView
        //   mapConfig={mapConfig}
        //   onMapInit={onMapInit}
        //   mapView={mapView}
        //   handleSinglePointChange={handleSinglePointChange}
        //   // handleMultiPointChange={handleMultiPointChange}
        //   inputType={question.input_type}
        // />
        <Controller
          name={name}
          control={control}
          render={() => (
            <DesktopTabletView
              mapConfig={mapConfig}
              mapLayers={mapLayers}
              inputType={question.input_type}
              onMapInit={onMapInit}
              mapView={mapView}
              handleSinglePointChange={handleSinglePointChange}
              data={watch(name)}
              // handleMultiPointChange={handleMultiPointChange}
            />
          )}
        />
      )}
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
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
