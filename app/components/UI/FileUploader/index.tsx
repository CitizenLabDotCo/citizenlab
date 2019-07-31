import React from 'react';

// components
import FileInput from './FileInput';
import FileDisplay from './FileDisplay';
import Error from 'components/UI/Error';

import { isFileUploadSupported } from 'utils/fileTools';

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

    if (!isFileUploadSupported()) {
      return null;
    }

    return (
      <>
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
