import React from 'react';
import {
  Select as SelectComponent,
  SelectProps,
} from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';
import { get } from 'lodash-es';
interface Props extends Omit<SelectProps, 'onChange'> {
  name: string;
}

const Select = ({ name, ...rest }: Props) => {
  const {
    trigger,
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  const validationError = get(errors, name)?.message as string | undefined;

  const apiError =
    (get(errors, name)?.error as string | undefined) &&
    ([get(errors, name)] as unknown as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <SelectComponent
              id={name}
              {...field}
              {...rest}
              onChange={(option) => {
                setValue(name, option.value);
                trigger(name);
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

export default Select;
