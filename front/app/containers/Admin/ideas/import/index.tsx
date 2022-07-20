import React, { useState } from 'react';
import { UploadFile } from 'typings';

import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import FileUploader from 'components/UI/FileUploader';

// resources
import { addIdeaImportFile } from 'services/ideaFiles';

const Import = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    addIdeaImportFile(fileToAdd.base64);
    setFiles((files) => [...files, fileToAdd]);
  };
  const err = { idea: [{ error: 'This is an error' }] };

  return (
    <FileUploader
      id={'bulk_idea_import'}
      onFileRemove={() => {}}
      onFileAdd={handleFileOnAdd}
      apiErrors={err}
      files={files}
    />
  );
};

export default injectIntl(Import);