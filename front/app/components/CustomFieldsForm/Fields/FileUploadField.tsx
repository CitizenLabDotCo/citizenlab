import React, { useEffect, useRef } from 'react';

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
  scrollErrorIntoView?: boolean;
}

type FileToUploadFormat = {
  file_by_content: {
    content: string;
    name: string;
  };
  name: string;
  id?: string | null;
};

const FileUploaderField = ({
  name,
  ideaId,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdeaFile } = useDeleteIdeaFile();
  const { mutate: addIdeaFile } = useAddIdeaFile();
  const processedFilesRef = useRef(new Set());

  const {
    setValue,
    formState: { errors },
    control,
    trigger,
    getValues,
  } = useFormContext();

  useEffect(() => {
    if (ideaFiles && ideaFiles.data.length > 0) {
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
        setValue(
          name,
          remoteFiles.map((file) => ({
            file_by_content: {
              content: file.base64,
              name: file.filename,
            },
            name: file.filename,
            id: file.id || null,
          })),
          { shouldDirty: true }
        );
        trigger(name);
      };
      convertFiles();
    }
  }, [setValue, name, ideaFiles, trigger]);

  useEffect(() => {
    const formFiles = getValues(name) || [];

    // Only process files we haven't seen before
    const newFiles = formFiles.filter(
      (file) => !processedFilesRef.current.has(file.file_by_content.content)
    );

    if (newFiles.length > 0) {
      newFiles.forEach((file) => {
        processedFilesRef.current.add(file.file_by_content.content);

        convertUrlToUploadFile(file.file_by_content.content, null, file.name);
      });
    }
  }, [getValues, name, ideaId]);

  const errorMessage = get(errors, name)?.message as string | undefined;

  const onFileRemove = (fileToRemove: FileType, value) => {
    if (ideaId && fileToRemove.id) {
      deleteIdeaFile({ ideaId, fileId: fileToRemove.id });
      setValue(
        name,
        value.filter((file: FileToUploadFormat) => fileToRemove.id !== file.id),
        { shouldDirty: true }
      );
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

    trigger(name);
  };

  const onFileAdd = (file: UploadFile, value) => {
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
        id: file.id || null,
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
        render={({ field: { ref: _ref, ...field } }) => {
          return (
            <FileUploaderComponent
              {...field}
              {...rest}
              data-cy={'e2e-idea-file-upload'}
              id={name}
              files={field.value || []}
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
          scrollIntoView={scrollErrorIntoView}
        />
      )}
    </Box>
  );
};

export default FileUploaderField;
