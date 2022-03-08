import React, { useContext, useEffect, useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import FileUploader from 'components/UI/FileUploader';
import { UploadFile } from 'typings';
import ErrorDisplay from '../ErrorDisplay';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import { FormContext } from 'components/Form/contexts';
import useResourceFiles from 'hooks/useResourceFiles';
import { isNilOrError } from 'utils/helperUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { deleteIdeaFile } from 'services/ideaFiles';

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

  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    const oldData = data ?? [];
    handleChange(path, [
      ...oldData,
      {
        file: { name: fileToAdd.filename, content: fileToAdd.base64 },
        name: fileToAdd.filename,
      },
    ]);
    setFiles((files) => [...files, fileToAdd]);
  };
  const handleFileOnRemove = (fileToRemove: UploadFile) => {
    if (inputId && fileToRemove.remote) {
      deleteIdeaFile(inputId, fileToRemove.id as string);
    }
    handleChange(
      path,
      data.filter((file) => file.file !== fileToRemove.base64)
    );
    setFiles((files) =>
      files.filter((file) => file.base64 !== fileToRemove.base64)
    );
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
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <FileUploader
        id={sanitizeForClassname(id)}
        onFileAdd={handleFileOnAdd}
        onFileRemove={handleFileOnRemove}
        files={files}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </>
  );
};

export default withJsonFormsControlProps(AttachmentsControl);

export const attachmentsControlTester: RankedTester = rankWith(
  10,
  scopeEndsWith('files_attributes')
);
