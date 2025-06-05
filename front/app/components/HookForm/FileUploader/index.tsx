import React, { useEffect } from 'react';

import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';

import Error from 'components/UI/Error';
import FileUploaderComponent, {
  Props as FileUploaderProps,
} from 'components/UI/FileUploader';

interface Props
  extends Omit<
    FileUploaderProps,
    'onFileAdd' | 'onFileRemove' | 'files' | 'id' | 'apiErrors'
  > {
  name: string;
  remoteFiles?: UploadFile[] | null;
}

const FileUploader = ({ name, remoteFiles }: Props) => {
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
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
              id={name}
              files={field.value}
              onFileAdd={(file) => {
                setValue(name, field.value ? [...field.value, file] : [file], {
                  shouldDirty: true,
                });
                trigger(name);
              }}
              onFileRemove={(fileToRemove) => {
                setValue(
                  name,
                  field.value.filter(
                    (file: UploadFile) => file.base64 !== fileToRemove.base64
                  ),
                  { shouldDirty: true }
                );
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
          scrollIntoView={false}
        />
      )}
    </>
  );
};

export default FileUploader;
