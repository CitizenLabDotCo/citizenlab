import React from 'react';
import TextareaComponent, {
  Props as TextAreaProps,
} from 'components/UI/TextArea';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError } from 'typings';

interface Props extends TextAreaProps {
  name: string;
}

const TextArea = ({ name, ...rest }: Props) => {
  const {
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  const defaultValue = '';

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
          <TextareaComponent
            id={name}
            {...field}
            {...rest}
            onBlur={() => {
              trigger();
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

export default TextArea;
