import React from 'react';
import { Box, Label } from '@citizenlab/cl2-component-library';
import ImagesDropzoneComponent, {
  Props as ImagesDropzoneComponentProps,
} from 'components/UI/ImagesDropzone';

import Error from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import ContentUploadDisclaimerTooltip from 'components/ContentUploadDisclaimer';

interface Props
  extends Omit<
    ImagesDropzoneComponentProps,
    'onAdd' | 'onRemove' | 'images' | 'id'
  > {
  name: string;
  inputLabel?: string;
  showDisclaimer?: boolean;
}

const ImagesDropzone = ({
  name,
  inputLabel,
  showDisclaimer,
  ...rest
}: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <>
      {inputLabel && (
        <Box display="flex" gap="8px">
          <Label htmlFor={name}>{inputLabel}</Label>
          {showDisclaimer && (
            <Box m='0px'>
              <ContentUploadDisclaimerTooltip />
            </Box>
          )}
        </Box>
      )}
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
