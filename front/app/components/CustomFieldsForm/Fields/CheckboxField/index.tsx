import React from 'react';

import { Checkbox } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

interface Props
  extends Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'onChange'> {
  name: string;
  scrollErrorIntoView?: boolean;
}

const CheckboxField = ({ name, scrollErrorIntoView, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
    watch,
    setValue,
    trigger,
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);
  const currentValue = watch(name) ? true : false;
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <Checkbox
            {...field}
            {...rest}
            id={name}
            checked={currentValue}
            onChange={() => {
              setValue(name, !currentValue);
              trigger(name);
            }}
          />
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
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </>
  );
};

export default CheckboxField;
