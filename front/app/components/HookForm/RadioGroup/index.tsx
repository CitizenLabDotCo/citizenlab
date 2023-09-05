import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

interface Props {
  name: string;
  children?: React.ReactNode;
}

const RadioGroup = ({ name, children }: Props) => {
  const {
    formState: { errors: formContextErrors },
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <Box border="none" as="fieldset">
      {children}
      {validationError && (
        <Error
          id={name}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          id={name}
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </Box>
  );
};

export default RadioGroup;
