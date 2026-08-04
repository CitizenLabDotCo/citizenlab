import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { UploadFile } from 'typings';

import { IIdeaFileData } from 'api/idea_files/types';
import useDeleteIdeaFile from 'api/idea_files/useDeleteIdeaFile';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

import Error from 'components/UI/Error';
import { Props as FileUploaderProps } from 'components/UI/FileUploader';
import FileDisplay from 'components/UI/FileUploader/FileDisplay';
import SingleFileInput from 'components/UI/SingleFileUploader/FileInput';

import { convertUrlToUploadFile } from 'utils/fileUtils';

// Mirrors Files::FileUploader#size_range, which stays authoritative. Compared
// against decimal MB here but binary MiB server-side, so this rejects marginally
// earlier — the safe direction.
export const MAX_FILE_SIZE_MB = 100;

interface Props
  extends Omit<
    FileUploaderProps,
    'onFileAdd' | 'onFileRemove' | 'files' | 'id' | 'apiErrors'
  > {
  name: string;
  ideaId?: string;
  scrollErrorIntoView?: boolean;
}

const SingleFileUploaderField = ({
  name,
  ideaId,
  scrollErrorIntoView,
}: Props) => {
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdeaFile } = useDeleteIdeaFile();
  const {
    setValue,
    setError,
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  // useWatch, not getValues: getValues doesn't subscribe, so removing a file
  // didn't re-render and the trash icon needed two clicks.
  const file = useWatch({ control, name });

  useEffect(() => {
    let isMounted = true;
    if (ideaFiles && ideaFiles.data.length > 0) {
      let remoteFile: IIdeaFileData | undefined = undefined;
      const convertFiles = async () => {
        remoteFile = ideaFiles.data.find(
          (ideaFile) => ideaFile.attributes.name === file?.name
        );
        if (!remoteFile) return;
        convertUrlToUploadFile(
          remoteFile.attributes.file.url || '',
          remoteFile.id,
          remoteFile.attributes.name
        ).then((file: UploadFile) => {
          if (!isMounted) return;
          setValue(
            name,
            {
              content: file.base64,
              name: file.filename,
              id: file.id || null,
            },
            { shouldDirty: true }
          );
          trigger(name);
        });
      };
      convertFiles();
    }
    return () => {
      isMounted = false;
    };
  }, [setValue, name, ideaFiles, trigger, file?.name]);

  const errorMessage = get(errors, name)?.message as string | undefined;

  const onFileRemove = () => {
    if (file?.id && ideaId) {
      deleteIdeaFile({
        fileId: file.id,
        ideaId,
      });
    }
    // null, not undefined: React Hook Form doesn't propagate undefined to the
    // Controller, leaving the removed file on screen and in the payload.
    setValue(name, null, { shouldDirty: true });
    trigger(name);
  };

  const onFileAdd = (file: UploadFile) => {
    const newFile = {
      content: file.base64,
      name: file.filename,
      id: file.id || null,
    };

    setValue(name, newFile, {
      shouldDirty: true,
    });

    trigger(name);
  };

  return (
    <Box data-cy="e2e-idea-file-upload" width="100%">
      <Controller
        name={name}
        control={control}
        render={({ field: { ref: _ref, ...field } }) =>
          field.value ? (
            <FileDisplay
              key={field.value.name}
              onDeleteClick={() => {
                onFileRemove();
              }}
              file={field.value}
            />
          ) : (
            <SingleFileInput
              onAdd={onFileAdd}
              id={name}
              {...field}
              maxSizeMb={MAX_FILE_SIZE_MB}
              onError={(message) => setError(name, { type: 'manual', message })}
            />
          )
        }
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

export default SingleFileUploaderField;
