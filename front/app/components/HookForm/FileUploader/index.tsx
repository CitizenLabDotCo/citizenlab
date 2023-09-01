import React, { useEffect } from 'react';
import FileUploaderComponent, {
  Props as FileUploaderProps,
} from 'components/UI/FileUploader';

import Error from 'components/UI/Error';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';
import { get } from 'lodash-es';

interface Props
  extends Omit<
    FileUploaderProps,
    'onFileAdd' | 'onFileRemove' | 'files' | 'id' | 'apiErrors'
  > {
  name: string;
  remoteFiles?: UploadFile[] | null;
}

const FileUploader = ({ name, remoteFiles, ...rest }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  useEffect(() => {
    if (remoteFiles) {
      setValue(name, remoteFiles);
    }
  }, [setValue, remoteFiles, name]);

  const errorMessage = get(errors, name)?.message as string | undefined;

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <FileUploaderComponent
              {...field}
              {...rest}
              id={name}
              files={field.value}
              onFileAdd={(file) => {
                setValue(name, field.value ? [...field.value, file] : [file], {
                  shouldDirty: true,
                });
              }}
              onFileRemove={(fileToRemove) =>
                setValue(
                  name,
                  field.value.filter(
                    (file: UploadFile) => file.base64 !== fileToRemove.base64
                  ),
                  { shouldDirty: true }
                )
              }
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

export default FileUploader;
