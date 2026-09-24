import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import Error, { TFieldName } from 'components/UI/Error';

import LinearScale from './LinearScale';

interface Props {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}

const LinearScaleField = ({ question, scrollErrorIntoView }: Props) => {
  const {
    control,
    watch,
    formState: { errors: formContextErrors },
  } = useFormContext();

  const name = question.key;
  // Use watch() rather than field.value: Controller falls back to the value the
  // field had when it mounted whenever the value is undefined, so clearing an
  // answer on a revisited page would not show.
  const value = watch(name);

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return <LinearScale question={question} {...field} value={value} />;
        }}
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

export default LinearScaleField;
