import React from 'react';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import Label from 'components/UI/Label';
import FileInput from 'components/UI/FileInput';
import FileDisplay from 'components/UI/FileDisplay';

// typings
import { UploadFile } from 'typings';

interface Props {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove: (fileToRemove: UploadFile) => void;
  localFiles: UploadFile[] | null | Error | undefined;
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
    const { localFiles } = this.props;
    return (
      <>
        <Label>
          <FormattedMessage {...messages.fileUploadLabel} />
        </Label>
        <FileInput
          onAdd={this.handleFileOnAdd}
        />
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
