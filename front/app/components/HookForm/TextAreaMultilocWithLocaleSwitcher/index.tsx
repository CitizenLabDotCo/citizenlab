import React from 'react';
import TextAreaMultilocWithLocaleSwitcherComponent, {
  Props as TextAreaMultilocWithLocaleSwitcherProps,
} from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, FieldError, useFormContext } from 'react-hook-form';
import { CLError, Locale, RHFErrors } from 'typings';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

type TextAreaProps = Props & {
  name: string;
};

export interface Props
  extends Omit<
    TextAreaMultilocWithLocaleSwitcherProps,
    'onChange' | 'valueMultiloc'
  > {
  name: string;
}

const TextAreaMultilocWithLocaleSwitcher = ({
  name,
  ...rest
}: TextAreaProps) => {
  const {
    formState: { errors: formContextErrors },
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

  const errors = get(formContextErrors, name) as RHFErrors;

  // Select the first error messages from the field's multiloc validation error
  const validationError = Object.values(
    (errors as Record<Locale, FieldError> | undefined) || {}
  )[0]?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <div id={name}>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <TextAreaMultilocWithLocaleSwitcherComponent
              id={name}
              {...field}
              {...rest}
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
    </div>
  );
};

export default TextAreaMultilocWithLocaleSwitcher;
