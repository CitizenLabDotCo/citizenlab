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
    formState: { errors },
    control,
    trigger,
  } = useFormContext();

  // Subscribed rather than read via getValues: getValues doesn't re-render, so
  // clearing the field in onFileRemove left the removed file on screen until an
  // unrelated state change happened to re-render (hence needing a second click).
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
    // Cleared with null rather than undefined: React Hook Form does not
    // propagate an undefined value to a mounted Controller, so the removed file
    // stayed on screen and in the submitted payload.
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
      {/*
        The Controller stays mounted whether or not a file is selected. It used
        to be rendered only when the field was empty, so removing a file
        re-mounted it — and registering a field whose value is undefined makes
        React Hook Form re-apply its defaultValue, silently restoring the file
        the user had just deleted.
      */}
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
            <SingleFileInput onAdd={onFileAdd} id={name} {...field} />
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
