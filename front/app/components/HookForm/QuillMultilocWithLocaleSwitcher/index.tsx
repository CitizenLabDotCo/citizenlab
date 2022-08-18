import React from 'react';

import Error from 'components/UI/Error';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { Locale } from 'typings';

// components
import QuillMultilocWithLocaleSwitcherComponent from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// typings

interface Props {
  name: string;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
}

const QuillMultilocWithLocaleSwitcher = ({ name, ...rest }: Props) => {
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
  const errorMessage = Object.values(
    (errors[name] as Record<Locale, FieldError> | undefined) || {}
  )[0]?.message;

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <QuillMultilocWithLocaleSwitcherComponent
            id={name}
            {...field}
            {...rest}
            valueMultiloc={{ ...defaultValue, ...field.value }}
          />
        )}
      />
      {errorMessage && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={errorMessage}
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default QuillMultilocWithLocaleSwitcher;
