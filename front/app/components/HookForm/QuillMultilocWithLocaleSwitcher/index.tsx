import React from 'react';

import { get } from 'lodash-es';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { SupportedLocale, CLError, RHFErrors } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import Error, { TFieldName } from 'components/UI/Error';
import QuillMultilocWithLocaleSwitcherComponent, {
  Props as QuillMultilocWithLocaleSwitcherComponentProps,
} from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { isNilOrError } from 'utils/helperUtils';

type Props = {
  id?: string;
  name: string;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
  hideLocaleSwitcher?: boolean;
  scrollErrorIntoView?: boolean;
} & Omit<
  QuillMultilocWithLocaleSwitcherComponentProps,
  'onChange' | 'valueMultiloc' | 'id'
>;

const QuillMultilocWithLocaleSwitcher = ({
  id,
  name,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales)) {
    return null;
  }

  const defaultValue: Partial<Record<SupportedLocale, any>> = locales.reduce(
    (acc, curr) => ((acc[curr] = ''), acc),
    {}
  );

  const errors = get(formContextErrors, name) as RHFErrors;
  // Select the first error messages from the field's multiloc validation error
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
        render={({ field: { ref: _ref, ...field } }) => (
          <QuillMultilocWithLocaleSwitcherComponent
            {...field}
            {...rest}
            id={id || name.replace(/\./g, '_')}
            valueMultiloc={{ ...defaultValue, ...field.value }}
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
    </>
  );
};

export default QuillMultilocWithLocaleSwitcher;
