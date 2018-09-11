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

// // services
// import { addPageFile, deletePageFile } from 'services/pageFiles';

// resources
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

// // utils
// import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  onFileAdd: (fileToAdd: UploadFile) => void;
  localPageFiles: UploadFile[] | null | Error | undefined;
}

interface DataProps {
  remotePageFiles: GetResourceFileObjectsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  localPageFiles: UploadFile[] | null | Error | undefined;
  saving: boolean;
  submitState: 'disabled' | 'enabled' | 'error' | 'success';
}

class FileUploader extends React.PureComponent<Props & WithRouterProps, State>{
  constructor(props: Props) {
    super(props as any);
    this.state = {
      localPageFiles: [],
      saving: false,
      submitState: 'disabled',
    };
  }

  handlePageFileOnAdd = (fileToAdd: UploadFile) => {
    this.props.onFileAdd(fileToAdd);
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

  // getFilesToAddPromises = () => {
  //   const { localPageFiles } = this.state;
  //   const { remotePageFiles } = this.props;
  //   const { id } = this.props.params;
  //   let filesToAdd = localPageFiles;
  //   let filesToAddPromises: Promise<any>[] = [];

  //   if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
  //     // localPageFiles = local state of files
  //     // This means those previously uploaded + files that have been added/removed
  //     // remotePageFiles = last saved state of files (remote)

  //     filesToAdd = localPageFiles.filter((localPageFile) => {
  //       return !remotePageFiles.some(remotePageFile => remotePageFile.filename === localPageFile.filename);
  //     });
  //   }

  //   if (id && !isNilOrError(filesToAdd) && filesToAdd.length > 0) {
  //     filesToAddPromises = filesToAdd.map((fileToAdd: any) => addPageFile(id as string, fileToAdd.base64, fileToAdd.name));
  //   }

  //   return filesToAddPromises;
  // }

  // getFilesToRemovePromises = () => {
  //   const { localPageFiles } = this.state;
  //   const { remotePageFiles } = this.props;
  //   const { id } = this.props.params;
  //   let filesToRemove = remotePageFiles;
  //   let filesToRemovePromises: Promise<any>[] = [];

  //   if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
  //     // localPageFiles = local state of files
  //     // This means those previously uploaded + files that have been added/removed
  //     // remotePageFiles = last saved state of files (remote)

  //     filesToRemove = remotePageFiles.filter((remotePageFile) => {
  //       return !localPageFiles.some(localPageFile => localPageFile.filename === remotePageFile.filename);
  //     });
  //   }

  //   if (id && !isNilOrError(filesToRemove) && filesToRemove.length > 0) {
  //     filesToRemovePromises = filesToRemove.map((fileToRemove: any) => deletePageFile(id as string, fileToRemove.id));
  //   }

  //   return filesToRemovePromises;
  // }

  // handleOnSubmit = async () => {
  //   const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises();
  //   const filesToRemovePromises: Promise<any>[] = this.getFilesToRemovePromises();

  //   const allPromises = [
  //     ...filesToAddPromises,
  //     ...filesToRemovePromises
  //   ];

  //   if (allPromises.length > 0) {
  //     this.setState({ saving: true });
  //     try {
  //       await Promise.all(allPromises);
  //       this.setState({ saving: false });
  //     } catch (errors) {
  //       this.setState({ saving: false });
  //     }
  //   }
  // }

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
