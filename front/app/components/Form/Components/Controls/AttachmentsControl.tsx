import React, { useContext, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { UploadFile } from 'typings';

import useAddIdeaFile from 'api/idea_files/useAddIdeaFile';
import useDeleteIdeaFile from 'api/idea_files/useDeleteIdeaFile';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

import { FormContext } from 'components/Form/contexts';
import FileUploader from 'components/UI/FileUploader';
import { FormLabel } from 'components/UI/FormComponents';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';

import { getSubtextElement } from './controlUtils';

const AttachmentsControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  required,
  id,
  schema,
  visible,
}: ControlProps) => {
  const { inputId } = useContext(FormContext);
  const { data: remoteFiles } = useIdeaFiles(inputId);
  const { mutate: addIdeaFile } = useAddIdeaFile();
  const { mutate: deleteIdeaFile } = useDeleteIdeaFile();

  const [didBlur, setDidBlur] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    const oldData = data ?? [];
    if (inputId) {
      addIdeaFile(
        {
          ideaId: inputId,
          file: {
            file: fileToAdd.base64,
            name: fileToAdd.name,
          },
        },
        {
          onSuccess: () => {
            handleChange(path, [...oldData, fileToAdd]);
          },
        }
      );
    } else {
      handleChange(path, [
        ...oldData,
        {
          file_by_content: {
            content: fileToAdd.base64,
            name: fileToAdd.filename,
          },
          name: fileToAdd.filename,
        },
      ]);
    }
    setFiles((files) => [...files, fileToAdd]);
    setDidBlur(true);
  };
  const handleFileOnRemove = (fileToRemove: UploadFile) => {
    if (inputId && fileToRemove.remote) {
      deleteIdeaFile(
        { ideaId: inputId, fileId: fileToRemove.id as string },
        {
          onSuccess: () => {
            handleChange(
              path,
              data?.length === 1
                ? undefined
                : data.filter((file) => file.id !== fileToRemove.id)
            );
          },
        }
      );
    } else {
      handleChange(
        path,
        data?.length === 1
          ? undefined
          : data.filter(
              (file) => file.file_by_content.content !== fileToRemove.base64
            )
      );
    }
    setFiles((files) =>
      files.filter((file) => file.base64 !== fileToRemove.base64)
    );
    setDidBlur(true);
  };

  useEffect(() => {
    if (inputId && !isNilOrError(remoteFiles) && remoteFiles.data.length > 0) {
      (async () => {
        const newRemoteFiles = (
          await Promise.all(
            remoteFiles.data.map(
              async (f) =>
                await convertUrlToUploadFile(f.attributes.file.url, f.id)
            )
          )
        ).filter((f) => f);
        setFiles(newRemoteFiles as UploadFile[]);
      })();
    } else if (data && data.length > 0) {
      // Handle local files (base64 strings)
      const localFiles = data
        .map((file) => {
          if (file.file_by_content?.content) {
            const base64 = file.file_by_content.content;
            return {
              base64,
              filename: file.name,
              remote: false,
              url: base64,
              name: file.name,
            } as UploadFile;
          }
          return null;
        })
        .filter((file) => file !== null) as UploadFile[];
      setFiles(localFiles);
    }
  }, [remoteFiles, inputId, data]);

  if (!visible) {
    return null;
  }

  return (
    <Box id="e2e-idea-file-upload">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      <FileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        files={files}
        maxSizeMb={10}
      />
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </Box>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('files_attributes')
);
