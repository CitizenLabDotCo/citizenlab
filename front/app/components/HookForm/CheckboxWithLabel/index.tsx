import React from 'react';

import { CheckboxWithLabel as CheckboxWithLabelComponent } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

interface Props
  extends Omit<
    React.ComponentProps<typeof CheckboxWithLabelComponent>,
    'checked' | 'onChange'
  > {
  name: string;
  dataTestId?: string;
  handleSideEffects?: () => void;
}

const CheckboxWithLabel = ({
  name,
  dataTestId,
  handleSideEffects,
  ...rest
}: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
    watch,
    setValue,
    trigger,
  } = useFormContext();

  const defaultValue = false;

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  const currentValue = watch(name);
  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, value, ...field } }) => (
          <CheckboxWithLabelComponent
            dataTestId={dataTestId}
            {...field}
            {...rest}
            checked={value}
            onChange={() => {
              setValue(name, !currentValue);
              handleSideEffects?.();
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

export default CheckboxWithLabel;
