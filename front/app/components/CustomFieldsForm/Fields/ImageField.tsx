import React, { useEffect, useState } from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';

import useDeleteIdeaImage from 'api/idea_images/useDeleteIdeaImage';
import useIdeaImages from 'api/idea_images/useIdeaImages';

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
  ideaId?: string;
  scrollErrorIntoView?: boolean;
}

const ImageField = ({
  name,
  inputLabel,
  ideaId,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { mutate: deleteIdeaImage } = useDeleteIdeaImage();
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

  useEffect(() => {
    if (ideaImages && ideaImages.data.length > 0) {
      let images: UploadFile[] = [];
      const convertImages = async () => {
        images = await Promise.all(
          ideaImages.data.map((image) =>
            convertUrlToUploadFile(
              image.attributes.versions.large || '',
              image.id
            )
          )
        ).then(
          (images) => images.filter((image) => image !== null) as UploadFile[]
        );
        console.log(images);
        setImages(images);
        setValue(
          name,
          images.map((image) => ({ image: image.base64 })),
          {
            shouldDirty: true,
          }
        );
      };
      convertImages();
    }
  }, [ideaImages, setValue, name]);

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <Box id={'e2e-idea-image-upload'} width="100%">
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
              images={images}
              onAdd={(file) => {
                setImages([file[0]]);
                setValue(name, [{ image: file[0]?.base64 }], {
                  shouldDirty: true,
                });
                trigger(name);
              }}
              onRemove={(image) => {
                if (image.id && ideaId) {
                  deleteIdeaImage({ ideaId, imageId: image.id });
                }
                setImages([]);
                setValue(name, null, { shouldDirty: true });
                trigger(name);
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
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </Box>
  );
};

export default ImageField;
