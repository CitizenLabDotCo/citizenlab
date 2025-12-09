import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { format, startOfDay } from 'date-fns';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import Error, { TFieldName } from 'components/UI/Error';

const DateField = ({
  name,
  scrollErrorIntoView,
  disabled,
}: {
  name: string;
  scrollErrorIntoView?: boolean;
  disabled?: boolean;
}) => {
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

  const value = watch(name);

  return (
    <Box>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref } }) => (
          <DateSinglePicker
            id={name}
            selectedDate={value ? new Date(value) : undefined}
            onChange={(value) => {
              setValue(name, format(startOfDay(value), 'yyyy-MM-dd'));
              trigger(name);
            }}
            disabled={disabled}
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
    </Box>
  );
};

export default DateField;
