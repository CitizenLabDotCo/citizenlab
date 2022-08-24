import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import {
  InputMultilocWithLocaleSwitcher as InputMultilocWithLocaleSwitcherComponent,
  InputMultilocWithLocaleSwitcherProps,
} from '@citizenlab/cl2-component-library';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { CLError, Locale } from 'typings';

interface Props
  extends Omit<
    InputMultilocWithLocaleSwitcherProps,
    'locales' | 'valueMultiloc'
  > {
  name: string;
}

const InputMultilocWithLocaleSwitcher = ({ name, ...rest }: Props) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales)) {
    return null;
  }

  const defaultValue: Partial<Record<Locale, any>> = locales.reduce(
    (acc, curr) => ((acc[curr] = ''), acc),
    {}
  );

  // Select the first error messages from the field's multiloc validation error
  const validationError = Object.values(
    (errors[name] as Record<Locale, FieldError> | undefined) || {}
  )[0]?.message;

  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);

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

export default InputMultilocWithLocaleSwitcher;
