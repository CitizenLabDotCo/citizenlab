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

const MultiFileUploadField = ({
  name,
  ideaId,
  scrollErrorIntoView,
  ...rest
}: Props) => {
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdeaFile } = useDeleteIdeaFile();
  const { mutate: addIdeaFile } = useAddIdeaFile();
  // For remote files, we need to store them in a state
  const [files, setFiles] = useState<Partial<UploadFile>[]>([]);
  const {
    setValue,
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  // If the ideaId is provided, we are dealing with an existing idea
  // and we need to fetch the files associated with it and convert them to UploadFile format
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
        setFiles(remoteFiles);
      };
      convertFiles();
    }
  }, [setValue, name, ideaFiles, trigger]);

  // If the ideaId is not provided, we are dealing with a new idea
  // and we need to convert the files to the format expected by the API
  useEffect(() => {
    if (!ideaId) {
      const convertedFiles = files.map((file) => ({
        file_by_content: { content: file.base64, name: file.filename },
        name: file.filename,
        id: file.id || null,
      })) as FileToUploadFormat[];
      setValue(name, convertedFiles, {
        shouldDirty: true,
      });
    }
  }, [files, ideaId, name, setValue]);

  const errorMessage = get(errors, name)?.message as string | undefined;

  const onFileRemove = (fileToRemove: FileType) => {
    if (ideaId && fileToRemove.id) {
      deleteIdeaFile({ ideaId, fileId: fileToRemove.id });
      setFiles((files) => files.filter((file) => file.id !== fileToRemove.id));
    } else {
      setFiles((files) =>
        files.filter((file) => file.base64 !== fileToRemove.base64)
      );
    }

    trigger(name);
  };

  const onFileAdd = (file: UploadFile) => {
    if (ideaId) {
      addIdeaFile({
        ideaId,
        file: {
          name: file.filename,
          file: file.base64,
        },
      });
    } else {
      const newFile: Partial<UploadFile> = {
        base64: file.base64,
        id: file.id || undefined,
        remote: false,
        filename: file.filename,
        name: file.filename,
      };

      setFiles((files) => [...files, newFile]);
      trigger(name);
    }
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
              files={files as FileType[]}
              onFileAdd={(fileToAdd) => onFileAdd(fileToAdd)}
              onFileRemove={(fileToRemove) => onFileRemove(fileToRemove)}
              maxSizeMb={10}
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

export default MultiFileUploadField;
