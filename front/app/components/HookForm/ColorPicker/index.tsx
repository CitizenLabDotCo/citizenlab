import React from 'react';
import {
  ColorPickerInput,
  ColorPickerInputProps,
} from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

interface Props
  extends Omit<ColorPickerInputProps, 'value' | 'onChange' | 'type'> {
  name: string;
}

const ColorPicker = ({ name, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const defaultValue = '';

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <ColorPickerInput type="text" id={name} {...field} {...rest} />
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

export default ColorPicker;
