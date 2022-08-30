import React from 'react';
import { Toggle as ToggleComponent } from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';

export interface ToggleProps {
  name: string;
  className?: string;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTextColor?: string;
}

const Toggle = ({ name, ...rest }: ToggleProps) => {
  const {
    formState: { errors },
    control,
    watch,
    setValue,
  } = useFormContext();

  const defaultValue = false;

  const validationError = errors[name]?.message as string | undefined;

  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);

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
