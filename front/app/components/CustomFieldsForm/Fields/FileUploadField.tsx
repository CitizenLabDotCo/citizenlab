import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';

import Error from 'components/UI/Error';
import FileUploaderComponent, {
  Props as FileUploaderProps,
} from 'components/UI/FileUploader';

import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props
  extends Omit<
    FileUploaderProps,
    'onFileAdd' | 'onFileRemove' | 'files' | 'id' | 'apiErrors'
  > {
  name: string;
  remoteFiles?: UploadFile[] | null;
}

type FileToUploadFormat = {
  file_by_content: {
    content: string;
    name: string;
  };
  name: string;
};

const FileUploaderField = ({ name, remoteFiles, ...rest }: Props) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
    getValues,
  } = useFormContext();

  // Todo: check that this works correctly with remote files
  useEffect(() => {
    if (remoteFiles) {
      setValue(name, remoteFiles);
    }
  }, [setValue, remoteFiles, name]);

  useEffect(() => {
    if (getValues(name)?.length !== files.length) {
      getValues(name)?.forEach((file: FileToUploadFormat) => {
        convertUrlToUploadFile(
          file.file_by_content.content,
          null,
          file.name
        ).then((file) => {
          setFiles((prevFiles) => (file ? [...prevFiles, file] : prevFiles));
        });
      });
    }
  }, [getValues, name, files.length]);

  const errorMessage = get(errors, name)?.message as string | undefined;

  return (
    <Box data-cy="e2e-idea-file-upload" width="100%">
      <Controller
        name={name}
        control={control}
        defaultValue={files}
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <FileUploaderComponent
              {...field}
              {...rest}
              data-cy={'e2e-idea-file-upload'}
              id={name}
              files={files}
              onFileAdd={(file) => {
                setFiles((prevFiles) => [...prevFiles, file]);
                const newFile = {
                  file_by_content: {
                    content: file.base64,
                    name: file.filename,
                  },
                  name: file.filename,
                };

                setValue(
                  name,
                  field.value ? [...field.value, newFile] : [newFile],
                  {
                    shouldDirty: true,
                  }
                );
                trigger(name);
              }}
              onFileRemove={(fileToRemove) => {
                setValue(
                  name,
                  field.value.filter(
                    (file: FileToUploadFormat) =>
                      fileToRemove.base64 !== file.file_by_content.content
                  ),
                  { shouldDirty: true }
                );
                setFiles((prevFiles) =>
                  prevFiles.filter(
                    (file) => file.base64 !== fileToRemove.base64
                  )
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
    </Box>
  );
};

export default FileUploaderField;
