import React from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import Label from 'components/UI/Label';
import FileInput from './FileInput';
import FileDisplay from './FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLError, UploadFile } from 'typings';

interface Props {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove: (fileToRemove: UploadFile) => void;
  files: UploadFile[] | null | Error | undefined;
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
    const { files, errors } = this.props;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return null;
    }

    return (
      <>
        <Label>
          <FormattedMessage {...messages.fileUploadLabel} />
        </Label>
        <FileInput
          onAdd={this.handleFileOnAdd}
        />
        {errors && <Error fieldName="file" apiErrors={errors.file} />}
        {Array.isArray(files) && files.map(file => (
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
