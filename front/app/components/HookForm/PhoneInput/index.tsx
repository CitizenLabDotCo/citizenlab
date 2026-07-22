import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import IntlTelInput from '@intl-tel-input/react';
import { Iso2 } from 'intl-tel-input';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import 'intl-tel-input/styles';

const StyledPhoneInput = styled(Box)`
  .iti {
    width: 100%;
  }

  /* The horizontal padding is set inline by intl-tel-input to make room for the
     country selector, so only the vertical padding is ours to set. */
  .iti__tel-input {
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid ${colors.borderDark};
    border-radius: 3px;
    font-size: 16px;

    &:focus {
      border-color: ${colors.black};
      outline: none;
    }
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

// We pass country codes around uppercase (that's how the app configuration stores
// them), but intl-tel-input only recognises them lowercase.
const toIso2 = (countryCode: string) => countryCode.toLowerCase() as Iso2;

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
          <IntlTelInput
            separateDialCode
            // The utils library is heavy, so we code-split it out of the main bundle.
            // The validator imports the same 'intl-tel-input/utils' module,
            // so it ends up bundled only once.
            loadUtils={() => import('intl-tel-input/utils')}
            onlyCountries={countries?.map(toIso2)}
            initialCountry={defaultCountry && toIso2(defaultCountry)}
            value={field.value}
            onChangeNumber={(number) => field.onChange(number)}
            inputProps={{
              id: name,
              placeholder,
              'aria-describedby': ariaDescribedBy,
              onBlur: () => {
                field.onBlur();
                onBlur?.();
              },
            }}
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
