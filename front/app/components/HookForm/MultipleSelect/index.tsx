import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, IOption, RHFErrors } from 'typings';

// import Error, { TFieldName } from 'components/UI/Error';
import ErrorPOC from 'components/UI/ErrorPOC';
import MultipleSelectComponent, {
  Props as MultipleSelectComponentProps,
} from 'components/UI/MultipleSelect';

interface Props
  extends Omit<MultipleSelectComponentProps, 'onChange' | 'value'> {
  name: string;
}

const MultipleSelect = ({ name, ...rest }: Props) => {
  const {
    trigger,
    setValue,
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;

  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <MultipleSelectComponent
              inputId={name}
              {...field}
              {...rest}
              onChange={(newOption: IOption[]) => {
                setValue(
                  name,
                  newOption.map((o) => o.value)
                );
                trigger();
              }}
            />
          );
        }}
      />
      {/* {validationError && (
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
      )} */}
      {validationError && (
        <ErrorPOC marginTop="8px" marginBottom="8px" text={validationError} />
      )}
      {apiError && (
        <ErrorPOC errors={apiError} marginTop="8px" marginBottom="8px" />
      )}
    </>
  );
};

export default MultipleSelect;
