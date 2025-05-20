import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import LinearScale from './LinearScale';

interface Props {
  question: IFlatCustomField;
}

const LinearScaleField = ({ question }: Props) => {
  const { control } = useFormContext();

  const name = question.key;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref: _ref, ...field } }) => {
        return <LinearScale question={question} {...field} />;
      }}
    />
  );
};

export default LinearScaleField;
