import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import LinearScale from './LinearScale';

interface Props {
  question: IFlatCustomField;
}

const LinearScaleField = ({ question }: Props) => {
  const { control, setValue, trigger } = useFormContext();

  const name = question.key;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref: _ref, ...field } }) => {
        return (
          <LinearScale
            question={question}
            onSelect={(value) => {
              field.onChange(value);
              setValue(name, value);
              trigger(name);
            }}
          />
        );
      }}
    />
  );
};

export default LinearScaleField;
