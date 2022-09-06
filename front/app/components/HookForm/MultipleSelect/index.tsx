import React from 'react';
import MultipleSelectComponent, {
  Props as MultipleSelectComponentProps,
} from 'components/UI/MultipleSelect';
import Error, { TFieldName } from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { CLError, IOption } from 'typings';

interface Props
  extends Omit<MultipleSelectComponentProps, 'onChange' | 'value'> {
  name: string;
}

const MultipleSelect = ({ name, ...rest }: Props) => {
  const {
    trigger,
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  const validationError = errors[name]?.message as string | undefined;

  const apiError =
    (errors[name]?.error as string | undefined) &&
    ([errors[name]] as unknown as CLError[]);

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

export default MultipleSelect;
