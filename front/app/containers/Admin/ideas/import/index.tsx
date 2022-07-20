import React, { useState } from 'react';
import { InjectedIntlProps } from 'react-intl';

import { UploadFile, CLErrors } from 'typings';

import { injectIntl } from 'utils/cl-intl';
// import messages from '../messages';

// components
import FileUploader from 'components/UI/FileUploader';

// resources
import { addIdeaImportFile } from 'services/ideaFiles';

const Import = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    try {
      await addIdeaImportFile(fileToAdd.base64);
      setFiles((files) => [...files, fileToAdd]);
    } catch (errors) {

        // const errorMessage = formatMessage(messages.importRequiredFieldError, {
        //   requiredField: 'title',
        // });

      // let errorMessage: string;
      // if (errors?.json?.requiredField) {
      //   errorMessage = formatMessage(messages.importRequiredFieldError, {
      //     requiredField: errors.json.requiredField,
      //   });
      // } else {
      //   errorMessage = formatMessage(messages.importGenericError);
      // }
      
      // setApiErrors({ file: [ { error: errorMessage } ]})
      setApiErrors(errors?.json)
    }
  };

  return (
    <FileUploader
      id={'bulk_idea_import'}
      onFileRemove={() => {}}
      onFileAdd={handleFileOnAdd}
      apiErrors={apiErrors}
      files={files}
    />
  );
};

export default injectIntl(Import);
