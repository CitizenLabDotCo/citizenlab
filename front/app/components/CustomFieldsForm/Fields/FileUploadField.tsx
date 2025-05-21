import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext } from 'react-hook-form';
import { UploadFile } from 'typings';

import useAddIdeaFile from 'api/idea_files/useAddIdeaFile';
import useDeleteIdeaFile from 'api/idea_files/useDeleteIdeaFile';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

import Error from 'components/UI/Error';
import FileUploaderComponent, {
  Props as FileUploaderProps,
} from 'components/UI/FileUploader';
import { FileType } from 'components/UI/FileUploader/FileDisplay';

import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props
  extends Omit<
    FileUploaderProps,
    'onFileAdd' | 'onFileRemove' | 'files' | 'id' | 'apiErrors'
  > {
  name: string;
  ideaId?: string;
}

type FileToUploadFormat = {
  file_by_content: {
    content: string;
    name: string;
  };
  name: string;
};

const FileUploaderField = ({ name, ideaId, ...rest }: Props) => {
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdeaFile } = useDeleteIdeaFile();
  const { mutate: addIdeaFile } = useAddIdeaFile();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
    getValues,
  } = useFormContext();

  useEffect(() => {
    if (ideaFiles) {
      let remoteFiles: UploadFile[] = [];
      const convertFiles = async () => {
        remoteFiles = await Promise.all(
          ideaFiles.data.map((file) =>
            convertUrlToUploadFile(
              file.attributes.file.url || '',
              file.id,
              file.attributes.name
            )
          )
        ).then(
          (files) => files.filter((file) => file !== null) as UploadFile[]
        );
        setFiles(remoteFiles);
      };
      convertFiles();
    }
  }, [setValue, name, ideaFiles]);

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

  const onFileRemove = (fileToRemove: FileType, value) => {
    if (ideaId && fileToRemove.id) {
      deleteIdeaFile({ ideaId, fileId: fileToRemove.id });
    } else {
      setValue(
        name,
        value.filter(
          (file: FileToUploadFormat) =>
            fileToRemove.base64 !== file.file_by_content.content
        ),
        { shouldDirty: true }
      );
    }
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.base64 !== fileToRemove.base64)
    );

    trigger(name);
  };
  console.log(name);
  const onFileAdd = (file: UploadFile, value) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    if (ideaId) {
      addIdeaFile({
        ideaId,
        file: {
          name: file.filename,
          file: file.base64,
        },
      });
    } else {
      const newFile = {
        file_by_content: {
          content: file.base64,
          name: file.filename,
        },
        name: file.filename,
      };

      setValue(name, value ? [...value, newFile] : [newFile], {
        shouldDirty: true,
      });
    }
    trigger(name);
  };

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
              onFileAdd={(fileToAdd) => onFileAdd(fileToAdd, field.value)}
              onFileRemove={(fileToRemove) =>
                onFileRemove(fileToRemove, field.value)
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
    </Box>
  );
};

export default FileUploaderField;
