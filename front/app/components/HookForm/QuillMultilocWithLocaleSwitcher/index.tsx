import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext, FieldError } from 'react-hook-form';
import { Locale, CLError } from 'typings';

// components
import QuillMultilocWithLocaleSwitcherComponent, {
  Props as QuillMultilocWithLocaleSwitcherComponentProps,
} from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { isNilOrError } from 'utils/helperUtils';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { get } from 'lodash-es';

type Props = {
  name: string;
  labelTooltipText?: string | JSX.Element | null;
  label?: string | JSX.Element | null;
  withCTAButton?: boolean;
} & Omit<
  QuillMultilocWithLocaleSwitcherComponentProps,
  'onChange' | 'valueMultiloc' | 'id'
>;

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
  const validationError = Object.values(
    (get(errors, name) as Record<Locale, FieldError> | undefined) || {}
  )[0]?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);
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
            id={name}
            valueMultiloc={{ ...defaultValue, ...field.value }}
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
    </>
  );
};

export default QuillMultilocWithLocaleSwitcher;
