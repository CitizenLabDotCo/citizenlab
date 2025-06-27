import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';

import Error from 'components/UI/Error';
import ImagesDropzoneComponent, {
  Props as ImagesDropzoneComponentProps,
} from 'components/UI/ImagesDropzone';

interface Props
  extends Omit<
    ImagesDropzoneComponentProps,
    'onAdd' | 'onRemove' | 'images' | 'id'
  > {
  name: string;
  inputLabel?: string;
}

const ImagesDropzone = ({ name, inputLabel, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
  } = useFormContext();
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <>
      {inputLabel && <Label htmlFor={name}>{inputLabel}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <ImagesDropzoneComponent
              {...field}
              {...rest}
              id={name}
              images={field.value}
              onAdd={(file) => {
                setValue(name, [file[0]], {
                  shouldDirty: true,
                });
              }}
              onRemove={() => setValue(name, null, { shouldDirty: true })}
            />
          );
        }}
      />
      {errorMessage && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={errorMessage}
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default ImagesDropzone;
