import React from 'react';
import {
  LocationInput as LocationInputComponent,
  LocationInputProps,
  Box,
} from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';
import { get } from 'lodash-es';

interface Props
  extends Omit<LocationInputProps, 'onChange' | 'onBlur' | 'value' | 'id'> {
  name: TFieldName;
}

const LocationInput = ({ name, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <Box width="100%">
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return <LocationInputComponent id={name} {...field} {...rest} />;
        }}
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
          fieldName={name}
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
