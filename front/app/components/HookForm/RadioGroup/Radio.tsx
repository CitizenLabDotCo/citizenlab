import React from 'react';

import {
  Radio as RadioComponent,
  RadioProps,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

interface Props extends Omit<RadioProps, 'onChange'> {
  id: string;
  name: string;
  canDeselect?: boolean; // Whether the radio can be deselected by clicking it again
}

const Radio = ({ name, id, canDeselect, ...rest }: Props) => {
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
              onClick={() => {
                // Deselect the radio button if it is already selected
                if (field.value === rest.value && canDeselect) {
                  setValue(name, '');
                  trigger(name);
                  return;
                }
              }}
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
