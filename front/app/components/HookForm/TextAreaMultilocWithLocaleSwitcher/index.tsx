import React from 'react';
import TextAreaMultilocWithLocaleSwitcherComponent, {
  Props as TextAreaMultilocWithLocaleSwitcherProps,
} from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, FieldError, useFormContext } from 'react-hook-form';
import { CLError, Locale } from 'typings';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

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
