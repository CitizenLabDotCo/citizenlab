import React from 'react';
import { Checkbox as CheckboxComponent } from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';
import { get } from 'lodash-es';

interface Props
  extends Omit<
    React.ComponentProps<typeof CheckboxComponent>,
    'checked' | 'onChange'
  > {
  name: string;
  handleSideEffects?: () => void;
}

const Checkbox = ({ name, handleSideEffects, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
    watch,
    setValue,
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
          <CheckboxComponent
            id={name}
            {...field}
            {...rest}
            checked={value}
            onChange={() => {
              setValue(name, !currentValue);
              handleSideEffects?.();
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

export default Checkbox;
