import React from 'react';

import {
  Select as SelectComponent,
  SelectProps,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

import { preventEnterToSubmit } from 'utils/preventEnterToSubmit';

interface Props extends Omit<SelectProps, 'onChange'> {
  name: string;
  scrollErrorIntoView?: boolean;
}

// Transparent wrapper (generates no layout box) used only to catch Enter
// keydowns bubbling up from the native <select> and prevent an accidental
// form submit.
const ContentsWrapper = styled.div`
  display: contents;
`;

const Select = ({ name, scrollErrorIntoView, ...rest }: Props) => {
  const {
    trigger,
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  const ariaDescribedBy =
    validationError || apiError ? `${name}-error` : undefined;

  return (
    <ContentsWrapper onKeyDown={preventEnterToSubmit}>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref, ...field }, fieldState }) => {
          return (
            <SelectComponent
              id={name}
              setRef={(el) => {
                ref(el);
              }}
              ariaInvalid={!!fieldState.error}
              ariaDescribedBy={ariaDescribedBy}
              {...field}
              {...rest}
              onChange={(option) => {
                setValue(name, option.value, { shouldDirty: true });
                trigger(name);
              }}
            />
          );
        }}
      />
      {validationError && (
        <Error
          id={`${name}-error`}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
        />
      )}
      {apiError && (
        <Error
          id={`${name}-error`}
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </ContentsWrapper>
  );
};

export default Select;
