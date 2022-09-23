import { Box } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { FormContext } from 'components/Form/contexts';
import FileUploader from 'components/UI/FileUploader';
import { FormLabel } from 'components/UI/FormComponents';
import useResourceFiles from 'hooks/useResourceFiles';
import React, { useContext, useEffect, useState } from 'react';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';
import { UploadFile } from 'typings';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import ErrorDisplay from '../ErrorDisplay';

const AttachmentsControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  required,
  id,
  schema,
}: ControlProps) => {
  const { inputId } = useContext(FormContext);
  const remoteFiles = useResourceFiles({
    resourceId: inputId || null,
    resourceType: 'idea',
  });
  const [didBlur, setDidBlur] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    const oldData = data ?? [];
    if (inputId) {
      addIdeaFile(inputId, fileToAdd.base64, fileToAdd.name);
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
      deleteIdeaFile(inputId, fileToRemove.id as string);
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
    if (inputId && !isNilOrError(remoteFiles) && remoteFiles.length > 0) {
      (async () => {
        const newRemoteFiles = (
          await Promise.all(
            remoteFiles.map(
              async (f) =>
                await convertUrlToUploadFile(
                  f.attributes.file.url as string,
                  f.id
                )
            )
          )
        ).filter((f) => f);
        newRemoteFiles && setFiles(newRemoteFiles as UploadFile[]);
      })();
    }
  }, [remoteFiles, inputId]);

  return (
    <Box id="e2e-idea-file-upload">
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={uischema.options?.description}
        subtextSupportsHtml
      />
      <FileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        files={files}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </Box>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  1000,
  scopeEndsWith('files_attributes')
);
