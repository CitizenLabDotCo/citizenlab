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
  const { trigger, setValue, control, watch } = useFormContext();
  // field.value falls back to the value the field had when it first appeared
  // whenever the answer is cleared, so the old answer stays selected.
  // watch() always gives the real current value.
  const value = watch(name);

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
                // Deselect the radio button if it is already selected. Clear it
                // to undefined rather than '', so the answer is left out of the
                // submission instead of being sent as a value that isn't an option.
                if (value === rest.value && canDeselect) {
                  setValue(name, undefined);
                  trigger(name);
                  return;
                }
              }}
              currentValue={value}
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
