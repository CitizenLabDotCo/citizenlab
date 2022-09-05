import React from 'react';

import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';

import PasswordInputComponent, {
  hasPasswordMinimumLength,
  Props as PasswordInputComponentProps,
} from 'components/UI/PasswordInput';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

interface Props
  extends Omit<
    PasswordInputComponentProps,
    'id' | 'password' | 'onChange' | 'errors'
  > {
  name: string;
}

const PasswordInput = ({ name, ...rest }: Props) => {
  const appConfig = useAppConfiguration();
  const {
    getValues,
    formState: { errors, touchedFields },
    control,
  } = useFormContext();

  const defaultValue = '';

  const passwordHasPasswordMinimumLengthError =
    touchedFields[name] &&
    hasPasswordMinimumLength(
      getValues(name) || '',
      !isNilOrError(appConfig)
        ? appConfig.data.attributes.settings.password_login?.minimum_length
        : undefined
    );

  const validationError = errors[name]?.message as string | undefined;

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
          <PasswordInputComponent
            {...field}
            {...rest}
            id={name}
            password={getValues(name)}
            errors={{
              minimumLengthError: passwordHasPasswordMinimumLengthError,
            }}
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

export default PasswordInput;
