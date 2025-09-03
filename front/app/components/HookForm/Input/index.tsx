import React from 'react';

import {
  Input as InputComponent,
  InputProps,
  Box,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

export interface Props extends InputProps {
  name: string;
  fieldName?: TFieldName;
  scrollErrorIntoView?: boolean;
}

const Input = ({
  name,
  fieldName,
  type = 'text',
  scrollErrorIntoView,
  ...rest
}: Props) => {
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
        render={({ field: { ref: _ref, ...field } }) => (
          <InputComponent id={name} type={type} {...field} {...rest} />
        )}
      />
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
          fieldName={fieldName || (name as TFieldName)}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </Box>
  );
};

export default Input;
