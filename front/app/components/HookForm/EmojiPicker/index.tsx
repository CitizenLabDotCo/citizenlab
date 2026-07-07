import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import EmojiPickerInput from 'components/UI/EmojiPicker';
import Error, { TFieldName } from 'components/UI/Error';

interface Props {
  name: string;
  label?: string;
}

const EmojiPicker = ({ name, label }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <Box>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field: { value, onChange } }) => (
          <EmojiPickerInput id={name} value={value} onChange={onChange} />
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
    </Box>
  );
};

export default EmojiPicker;
