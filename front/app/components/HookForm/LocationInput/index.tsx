import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import {
  default as LocationInputComponent,
  LocationInputProps,
  Option,
} from 'components/UI/LocationInput';

import { geocode, Point } from 'utils/locationTools';

interface Props extends LocationInputProps {
  name: string;
  fieldName?: TFieldName;
}

const LocationInput = ({ name, fieldName, ...rest }: Props) => {
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

  const getLocationGeojson = async (location_description: string) => {
    let location_point_geojson: Point | null = null;
    if (location_description) {
      location_point_geojson = await geocode(location_description);
    }
    return location_point_geojson;
  };

  const locationDescription = watch(name);

  const value = locationDescription
    ? {
        label: locationDescription,
        value: locationDescription,
      }
    : null;

  return (
    <Box width="100%">
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <LocationInputComponent
            id={name}
            {...field}
            {...rest}
            value={value}
            onChange={async (option: Option | null) => {
              if (locationDescription) {
                const location_point_geojson = await getLocationGeojson(
                  locationDescription
                );
                setValue('location_point_geojson', location_point_geojson);
              }
              setValue(name, option?.value || null);
            }}
          />
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          fieldName={fieldName || (name as TFieldName)}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </Box>
  );
};

export default LocationInput;
