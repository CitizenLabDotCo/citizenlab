import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import Label from 'components/UI/Label';
import FileInput from 'components/UI/FileInput';
import FileDisplay from 'components/UI/FileDisplay';

// typings
import { UploadFile } from 'typings';

// resources
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {}

interface DataProps {
  remotePageFiles: GetResourceFileObjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  localPageFiles: UploadFile[] | null | Error | undefined;
}

class FileUploader extends React.PureComponent<Props & WithRouterProps, State>{
  constructor(props: Props) {
    super(props as any);
    this.state = {
      localPageFiles: [],
    };
  }

  handlePageFileOnAdd = (fileToAdd: UploadFile) => {
    this.setState((prevState: State) => {
      const oldLocalPageFiles = !isNilOrError(prevState.localPageFiles) ? prevState.localPageFiles : [];

      return {
        localPageFiles: [
          ...oldLocalPageFiles,
          fileToAdd
        ]
      };
    });
  }

  handlePageFileOnRemove = (fileToRemove: UploadFile) => () => {
    this.setState((prevState: State) => {
      let localPageFiles: UploadFile[] | null = null;

      if (Array.isArray(prevState.localPageFiles)) {
        localPageFiles = prevState.localPageFiles.filter(pageFile => pageFile.filename !== fileToRemove.filename);
      }

      return {
        localPageFiles
      };
    });
  }

  render() {
    const { localPageFiles } = this.state;
    return (
      <>
        <Label>
          <FormattedMessage {...messages.fileUploadLabel} />
        </Label>
        <FileInput
          onAdd={this.handlePageFileOnAdd}
        />
        {Array.isArray(localPageFiles) && localPageFiles.map(file => (
          <FileDisplay
            key={file.id || file.filename}
            onDeleteClick={this.handlePageFileOnRemove(file)}
            file={file}
          />)
        )}
      </>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetResourceFileObjects resourceType="page" resourceId={inputProps.params.id}>
    {remotePageFiles => <FileUploader {...inputProps} remotePageFiles={remotePageFiles} />}
  </GetResourceFileObjects>
));
