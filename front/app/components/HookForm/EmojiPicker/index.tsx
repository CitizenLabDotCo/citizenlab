import React from 'react';

import { Label, boLabelStyle } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import EmojiPickerInput from 'components/UI/EmojiPicker';
import Error, { TFieldName } from 'components/UI/Error';

const Container = styled.div`
  &[data-variant='bo'] {
    ${boLabelStyle}
  }
`;

interface Props {
  name: string;
  label?: string;
  variant?: 'default' | 'bo';
}

const EmojiPicker = ({ name, label, variant = 'default' }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <Container data-variant={variant}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field: { value, onChange } }) => (
          <EmojiPickerInput
            id={name}
            value={value}
            onChange={onChange}
            variant={variant}
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
    </Container>
  );
};

export default EmojiPicker;
