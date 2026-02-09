import React from 'react';

import { Controller, get, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import Error, { TFieldName } from 'components/UI/Error';
import TextareaComponent, {
  Props as TextAreaProps,
} from 'components/UI/TextArea';

interface Props extends TextAreaProps {
  name: string;
  scrollErrorIntoView?: boolean;
}

const TextArea = ({ name, scrollErrorIntoView, ...rest }: Props) => {
  const {
    formState: { errors: formContextErrors },
    control,
    trigger,
  } = useFormContext();

  const defaultValue = '';

  const errors = get(formContextErrors, name) as RHFErrors;
  const validationError = errors?.message;

  // If an API error with a matching name has been returned from the API response, apiError is set to an array with the error message as the only item
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field: { ref: _ref, ...field } }) => (
          <TextareaComponent
            id={name}
            {...field}
            {...rest}
            onBlur={() => {
              trigger(name);
            }}
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

export default TextArea;
