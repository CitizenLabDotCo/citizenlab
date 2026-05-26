import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import Error, { TFieldName } from 'components/UI/Error';

import Matrix from './Matrix';

interface Props {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}

const MatrixField = ({ question, scrollErrorIntoView }: Props) => {
  const {
    control,
    formState: { errors: formContextErrors, submitCount },
  } = useFormContext();

  const name = question.key;

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);
  const showValidationError = submitCount > 0 && validationError;

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return <Matrix question={question} {...field} />;
        }}
      />
      {showValidationError && (
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

export default MatrixField;
