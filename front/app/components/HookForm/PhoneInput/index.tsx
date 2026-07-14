import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import PhoneInputComponent, { Country, Value } from 'react-phone-number-input';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';

import 'react-phone-number-input/style.css';

const StyledPhoneInput = styled(Box)`
  .PhoneInputInput {
    padding: 10px;
    border: 1px solid ${colors.borderDark};
    border-radius: 3px;
    font-size: 16px;

    &:focus {
      border-color: ${colors.black};
      outline: none;
    }
  }

  .PhoneInputCountry {
    margin-right: 8px;
  }
`;

export interface Props {
  name: string;
  fieldName?: TFieldName;
  // ISO 3166-1 alpha-2 codes to restrict the country dropdown. Omit for all countries.
  countries?: string[];
  defaultCountry?: string;
  placeholder?: string;
  scrollErrorIntoView?: boolean;
  onBlur?: () => void;
}

const PhoneInput = ({
  name,
  fieldName,
  countries,
  defaultCountry,
  placeholder,
  scrollErrorIntoView,
  onBlur,
}: Props) => {
  const {
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
    <StyledPhoneInput width="100%">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PhoneInputComponent
            id={name}
            // Show the country calling code (e.g. "+32") as a fixed prefix so the
            // user knows to enter only their local number. The prefix is tied to
            // the selected country, so typed digits stay in that country.
            international
            withCountryCallingCode
            value={(field.value as Value) || undefined}
            onChange={(value) => field.onChange(value ?? '')}
            onBlur={() => {
              field.onBlur();
              onBlur?.();
            }}
            countries={countries as Country[] | undefined}
            defaultCountry={defaultCountry as Country | undefined}
            placeholder={placeholder}
            aria-describedby={ariaDescribedBy}
          />
        )}
      />
      {validationError && (
        <Error
          id={`${name}-error`}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={scrollErrorIntoView}
          liveRegion={false}
        />
      )}
      {apiError && (
        <Error
          id={`${name}-error`}
          fieldName={fieldName || (name as TFieldName)}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </StyledPhoneInput>
  );
};

export default PhoneInput;
