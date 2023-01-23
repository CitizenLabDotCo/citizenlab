import React from 'react';
import { Toggle as ToggleComponent } from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';
import { get } from 'lodash-es';

export interface ToggleProps {
  name: string;
  className?: string;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTextColor?: string;
}

const Toggle = ({ name, ...rest }: ToggleProps) => {
  const {
    formState: { errors: formContextErrors },
    control,
    watch,
    setValue,
  } = useFormContext();

  const defaultValue = false;
  const errors = get(formContextErrors, name);
  const validationError = errors?.message as string | undefined;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError =
    (errors?.error as string | undefined) && ([errors] as unknown as CLError[]);

  const currentValue = watch(name);
  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, value, ...field } }) => {
          return (
            <ToggleComponent
              id={name}
              {...field}
              {...rest}
              checked={value}
              onChange={() => {
                setValue(name, !currentValue);
              }}
            />
          );
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

export default Toggle;
