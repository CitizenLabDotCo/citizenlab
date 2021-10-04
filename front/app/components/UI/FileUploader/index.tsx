import React, { PureComponent } from 'react';

// components
import FileInput from './FileInput';
import FileDisplay from './FileDisplay';
import Error from 'components/UI/Error';

// typings
import { CLError, UploadFile } from 'typings';

// style
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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

export default class FileUploader extends PureComponent<Props, State> {
  handleFileOnAdd = (fileToAdd: UploadFile) => {
    this.props.onFileAdd(fileToAdd);
  };

  handleFileOnRemove = (fileToRemove: UploadFile) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onFileRemove(fileToRemove);
  };

  render() {
    const { files, errors, id, className } = this.props;
    const fileNames =
      Array.isArray(files) && files.map((file) => file.filename).join(', ');
    return (
      <Container className={className}>
        <FileInput onAdd={this.handleFileOnAdd} id={id} />

        {errors && <Error fieldName="file" apiErrors={errors.file} />}

        {Array.isArray(files) &&
          files.map((file) => (
            <FileDisplay
              key={file.id || file.filename}
              onDeleteClick={this.handleFileOnRemove(file)}
              file={file}
            />
          ))}
        <ScreenReaderOnly aria-live="polite">
          {Array.isArray(files) && files.length === 0 && (
            <FormattedMessage {...messages.a11y_noFiles} />
          )}
          {Array.isArray(files) && files.length > 0 && (
            <FormattedMessage
              {...messages.a11y_filesToBeUploaded}
              values={{ fileNames }}
            />
          )}
        </ScreenReaderOnly>
      </Container>
    );
  }
}
