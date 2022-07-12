import React from 'react';
import { Input, InputProps } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';

export interface Props extends InputProps {
  name: string;
}

const RHFInput = ({ name, ...rest }: Props) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  const defaultValue = '';

  const errorMessage = errors[name]?.message as string | undefined;

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
      {errorMessage && (
        <Error marginTop="8px" marginBottom="8px" text={errorMessage} />
      )}
    </>
  );
};

export default RHFInput;
