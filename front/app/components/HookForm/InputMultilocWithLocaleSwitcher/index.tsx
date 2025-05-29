import React from 'react';

import {
  InputMultilocWithLocaleSwitcher as InputMultilocWithLocaleSwitcherComponent,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { CLError, SupportedLocale, RHFErrors } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import Error, { TFieldName } from 'components/UI/Error';

import { isNilOrError } from 'utils/helperUtils';

interface Props
  extends Omit<
    InputMultilocWithLocaleSwitcherProps,
    'locales' | 'valueMultiloc' | 'type'
  > {
  name: string;
  scrollErrorIntoView?: boolean;
}

const InputMultilocWithLocaleSwitcher = ({
  name,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const locales = useAppConfigurationLocales();
  const locale = useLocale();

  if (isNilOrError(locales)) {
    return null;
  }

  const defaultValue: Partial<Record<SupportedLocale, any>> = locales.reduce(
    (acc, curr) => ((acc[curr] = ''), acc),
    {}
  );

  // Select the first error messages from the field's multiloc validation error
  const errors = get(formContextErrors, name) as RHFErrors;

  const validationError = Object.values(
    (errors as Record<SupportedLocale, FieldError> | undefined) || {}
  )[0]?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <InputMultilocWithLocaleSwitcherComponent
              id={name}
              {...field}
              {...rest}
              locales={locales}
              type="text"
              valueMultiloc={{ ...defaultValue, ...field.value }}
              initiallySelectedLocale={locale}
            />
          );
        }}
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
    </>
  );
};

export default InputMultilocWithLocaleSwitcher;
