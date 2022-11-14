import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';

import TabsComponent, { Props as TabsComponentProps } from 'components/UI/Tabs';

interface Props
  extends Omit<
    TabsComponentProps,
    'id' | 'errors' | 'selectedValue' | 'onClick'
  > {
  name: string;
}

const Tabs = ({ name, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  const validationError = errors[name]?.message as string | undefined;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => (
          <TabsComponent
            {...field}
            {...rest}
            selectedValue={field.value}
            onClick={(newValue) => {
              setValue(name, newValue);
              trigger();
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

export default Tabs;
