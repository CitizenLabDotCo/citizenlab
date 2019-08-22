import React, { PureComponent } from 'react';

// components
import FileInput from './FileInput';
import FileDisplay from './FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLError, UploadFile } from 'typings';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

interface Props {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove: (fileToRemove: UploadFile) => void;
  files: UploadFile[] | null | Error | undefined;
  errors?: { [fieldName: string]: CLError[] } | null;
  id?: string;
  className?: string;
}

interface State {}

export default class FileUploader extends PureComponent<Props, State>{

  handleFileOnAdd = (fileToAdd: UploadFile) => {
    this.props.onFileAdd(fileToAdd);
  }

  handleFileOnRemove = (fileToRemove: UploadFile) => () => {
    this.props.onFileRemove(fileToRemove);
  }

  render() {
    const { files, errors, id, className } = this.props;

    return (
      <Container className={className}>
        <FileInput
          onAdd={this.handleFileOnAdd}
          id={id}
        />

        {errors && <Error fieldName="file" apiErrors={errors.file} />}

        {Array.isArray(files) && files.map(file => (
          <FileDisplay
            key={file.id || file.filename}
            onDeleteClick={this.handleFileOnRemove(file)}
            file={file}
          />)
        )}
      </Container>
    );
  }
}
