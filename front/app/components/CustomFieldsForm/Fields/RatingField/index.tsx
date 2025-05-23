import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import Rating from './Rating';
import Error, { TFieldName } from 'components/UI/Error';
import { CLError, RHFErrors } from 'typings';

interface Props {
  question: IFlatCustomField;
}

const RatingField = ({ question }: Props) => {
  const {
    control,
    formState: { errors: formContextErrors },
  } = useFormContext();

  const name = question.key;

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return <Rating question={question} {...field} />;
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

export default RatingField;
