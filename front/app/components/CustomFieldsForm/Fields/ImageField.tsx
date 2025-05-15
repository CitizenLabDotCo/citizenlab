import React, { useEffect, useState } from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';

import Error from 'components/UI/Error';
import ImagesDropzoneComponent, {
  Props as ImagesDropzoneComponentProps,
} from 'components/UI/ImagesDropzone';

import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props
  extends Omit<
    ImagesDropzoneComponentProps,
    'onAdd' | 'onRemove' | 'images' | 'id'
  > {
  name: string;
  inputLabel?: string;
}

const ImageField = ({ name, inputLabel, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
    getValues,
    trigger,
  } = useFormContext();
  const [images, setImages] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (getValues(name)) {
      convertUrlToUploadFile(getValues(name)[0]?.image).then((file) => {
        setImages(file ? [file] : []);
      });
    }
  }, [getValues, name]);

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
              data-cy={'e2e-idea-image-upload'}
              id={name}
              images={images}
              onAdd={(file) => {
                setImages([file[0]]);
                setValue(name, [{ image: file[0]?.base64 }], {
                  shouldDirty: true,
                });
                trigger(name);
              }}
              onRemove={() => {
                setImages([]);
                setValue(name, null, { shouldDirty: true });
              }}
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

export default ImageField;
