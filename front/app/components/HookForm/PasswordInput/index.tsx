import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import PasswordInputComponent, {
  Props as PasswordInputComponentProps,
} from 'components/UI/PasswordInput';

interface Props
  extends Omit<
    PasswordInputComponentProps,
    'id' | 'password' | 'onChange' | 'errors'
  > {
  name: string;
}

const PasswordInput = ({ name, ...rest }: Props) => {
  const {
    getValues,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const defaultValue = '';

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <PasswordInputComponent
            {...field}
            {...rest}
            id={name}
            password={getValues(name)}
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
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default PasswordInput;
