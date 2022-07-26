import React from 'react';
import { Input, InputProps } from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';

export interface Props extends InputProps {
  name: string;
}

const RHFInput = ({ name, ...rest }: Props) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  const defaultValue = '';

  const validationError = errors[name]?.message as string | undefined;

  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <Input id={name} {...field} {...rest} />
        )}
      />
      {validationError && (
        <Error marginTop="8px" marginBottom="8px" text={validationError} />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
        />
      )}
    </>
  );
};

export default RHFInput;
