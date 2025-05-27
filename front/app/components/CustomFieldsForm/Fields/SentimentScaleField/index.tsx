import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { CLError, RHFErrors } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import Input from 'components/HookForm/Input';
import Error, { TFieldName } from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SentimentScale from './SentimentScale';

interface Props {
  question: IFlatCustomField;
}

const SentimentScaleField = ({ question }: Props) => {
  const { formatMessage } = useIntl();

  const {
    control,
    watch,
    formState: { errors: formContextErrors },
    setValue,
  } = useFormContext();

  const name = question.key;
  const followUpName = `${name}_follow_up`;

  const value: number | undefined = watch(name);

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, onChange, ...field } }) => {
          return (
            <SentimentScale
              question={question}
              {...field}
              onChange={(value) => {
                // On reset value, also reset follow up value
                if (value === undefined) {
                  setValue(followUpName, undefined);
                }
                onChange(value);
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
      {value !== undefined && (
        <Input
          name={followUpName}
          type="text"
          placeholder={formatMessage(messages.tellUsWhy)}
        />
      )}
    </>
  );
};

export default SentimentScaleField;
