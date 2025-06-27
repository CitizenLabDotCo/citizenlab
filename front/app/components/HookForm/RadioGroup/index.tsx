import React from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

interface Props {
  name: string;
  children?: React.ReactNode;
  scrollErrorIntoView?: boolean;
}

const RadioGroup = ({
  name,
  children,
  scrollErrorIntoView,
  ...props
}: Props & BoxProps) => {
  const {
    formState: { errors: formContextErrors },
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <Box border="none" as="fieldset" p={props.padding}>
      {children}
      {validationError && (
        <Error
          id={name}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          id={name}
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </Box>
  );
};

export default RadioGroup;
