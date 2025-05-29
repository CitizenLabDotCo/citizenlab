import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import Error, { TFieldName } from 'components/UI/Error';

import Cosponsors from './Cosponsors';

interface Props {
  question: IFlatCustomField;
  scrollErrorIntoView: boolean;
}

const CosponsorsField = ({ question, scrollErrorIntoView }: Props) => {
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
          return <Cosponsors question={question} {...field} />;
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

export default CosponsorsField;
