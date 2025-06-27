import React from 'react';

import {
  Radio as RadioComponent,
  RadioProps,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

interface Props extends Omit<RadioProps, 'onChange'> {
  id: string;
  name: string;
}

const Radio = ({ name, id, ...rest }: Props) => {
  const { trigger, setValue, control } = useFormContext();

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <RadioComponent
              {...field}
              {...rest}
              id={id}
              currentValue={field.value}
              onChange={(value) => {
                setValue(name, value);
                trigger(name);
              }}
            />
          );
        }}
      />
    </>
  );
};

export default Radio;
