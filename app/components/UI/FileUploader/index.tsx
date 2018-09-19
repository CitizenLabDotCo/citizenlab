import React from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import Label from 'components/UI/Label';
import FileInput from 'components/UI/FileInput';
import FileDisplay from 'components/UI/FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLError, UploadFile } from 'typings';

interface Props {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove: (fileToRemove: UploadFile) => void;
  localFiles: UploadFile[] | null | Error | undefined;
  errors?: { [fieldName: string]: CLError[] } | null;
}

interface State {}

export default class FileUploader extends React.PureComponent<Props, State>{

  handleFileOnAdd = (fileToAdd: UploadFile) => {
    this.props.onFileAdd(fileToAdd);
  }

  handleFileOnRemove = (fileToRemove: UploadFile) => () => {
    this.props.onFileRemove(fileToRemove);
  }

  render() {
    const { localFiles, errors } = this.props;
    return (
      <>
        <Label>
          <FormattedMessage {...messages.fileUploadLabel} />
        </Label>
        <FileInput
          onAdd={this.handleFileOnAdd}
        />
        <Error fieldName="file" apiErrors={errors && errors.file} />
        {Array.isArray(localFiles) && localFiles.map(file => (
          <FileDisplay
            key={file.id || file.filename}
            onDeleteClick={this.handleFileOnRemove(file)}
            file={file}
          />)
        )}
      </>
    );
  }
}
