import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import PasswordInputComponent, {
  Props as PasswordInputComponentProps,
} from 'components/UI/PasswordInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props
  extends Omit<
    PasswordInputComponentProps,
    'id' | 'password' | 'onChange' | 'errors'
  > {
  name: string;
  id?: string;
  label?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

const PasswordInput = ({ name, label, id, ...rest }: Props) => {
  const {
    getValues,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();
  const { formatMessage } = useIntl();

  const defaultValue = '';

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);
  const ariaInvalidId = validationError || apiError ? true : undefined;
  const ariaDescribedById =
    validationError || apiError ? `${name}-error` : undefined;
  return (
    <>
      {label && (
        <Label htmlFor={id ?? name}>
          <span>{label}</span>
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <PasswordInputComponent
            {...field}
            {...rest}
            id={id ?? name}
            aria-label={formatMessage(messages.passwordLabel)}
            password={getValues(name)}
            ariaInvalid={ariaInvalidId}
            ariaDescribedBy={ariaDescribedById}
          />
        )}
      />
      {validationError && (
        <Error
          id={`${name}-error`}
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          id={`${name}-error`}
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
