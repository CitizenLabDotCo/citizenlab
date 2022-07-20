import React, { useState } from 'react';
import { UploadFile } from 'typings';
import { get } from 'lodash-es';

import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// components
import FileUploader from 'components/UI/FileUploader';

// resources
import { addIdeaImportFile } from 'services/ideaFiles';

const Import = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  var err = { file: [{ error: 'test' }, { error: 'tost' }] };

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    try {
      addIdeaImportFile(fileToAdd.base64);
      setFiles((files) => [...files, fileToAdd]);
    } catch (errors) {
      // this.setState({
      //   errors: get(errors, 'json.errors', null),
      //   processing: false,
      //   saved: false,
      //   submitState: 'error',
      // });
      err = get(errors, 'json.errors', null);
    }
  };

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
