// Libraries
import React from 'react';
import { Formik } from 'formik';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Components
import Icon from 'components/UI/Icon';
import PageForm, { FormValues } from 'components/PageForm';

// Services & resources
import { createPage, updatePage, IPage } from 'services/pages';
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import GetResourceFileObjects, { GetResourceFileObjectsChildProps } from 'resources/GetResourceFileObjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// Typings
import { CLErrorsJSON, UploadFile } from 'typings';

const timeout = 350;

const EditorWrapper = styled.div`
  margin-bottom: 35px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const DeployIcon = styled(Icon) `
  height: 12px;
  fill: ${colors.adminSecondaryTextColor};
  margin-right: 12px;
  transition: transform 200ms ease-out;
  transform: rotate(0deg);
`;

const Toggle = styled.div`
  color: ${colors.adminSecondaryTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover,
  &.deployed {
    color: ${colors.adminTextColor};

    ${DeployIcon} {
      fill: ${colors.adminTextColor};
    }
  }

  &.deployed {
    ${DeployIcon} {
      transform: rotate(90deg);
    }
  }
`;

const EditionForm = styled.div`
  overflow: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-top: 15px;
  max-width: 830px;

  &.page-enter {
    max-height: 0px;

    &.page-enter-active {
      max-height: 1000vh;
    }
  }

  &.page-exit {
    max-height: 1000vh;

    &.page-exit-active {
      max-height: 0px;
    }
  }
`;

interface DataProps {
  page: GetPageChildProps;
  remotePageFiles: GetResourceFileObjectsChildProps;
}

interface InputProps {
  className?: string;
  slug: string;
}

interface Props extends DataProps, InputProps {}

interface State {
  deployed: boolean;
  localPageFiles: GetResourceFileObjectsChildProps;
}

class PageEditor extends React.PureComponent<Props, State>{

  constructor(props: Props) {
    super(props as any);
    this.state = {
      deployed: false,
      localPageFiles: [],
    };
  }

  // componentDidUpdate(prevProps: Props) {
  //   const { remotePageFiles } = this.props;

  //   if (prevProps.remotePageFiles !== remotePageFiles) {
  //     this.setState({ localPageFiles: remotePageFiles });
  //   }
  // }

  toggleDeploy = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  initialValues = () => {
    const { page } = this.props;
    if (!isNilOrError(page)) {
      return {
        title_multiloc: page.attributes.title_multiloc,
        slug: page.attributes.slug,
        body_multiloc: page.attributes.body_multiloc,
      };
    } else {
      return {
        title_multiloc: { en: this.props.slug },
        body_multiloc: {},
      };
    }
  }

  handlePageFileOnAdd = (fileToAdd: UploadFile) => {
    this.setState((prevState: State) => {
      // If we don't have localPageFiles, we assign an empty array
      // A spread operator works on an empty array, but not on null
      const oldlLocalPageFiles = !isNilOrError(prevState.localPageFiles) ? prevState.localPageFiles : [];

      return {
        localPageFiles: [
          ...oldlLocalPageFiles,
          fileToAdd
        ]
      };
    });
  }

  handlePageFileOnRemove = (fileToRemove: UploadFile) => {
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

  handleSubmit = (values: FormValues, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { page } = this.props;

    let savePromise: Promise<IPage> | null = null;

    if (page === undefined) {
      return;
    } else {
      setSubmitting(true);
      setStatus(null);
      if (isNilOrError(page)) {
        savePromise = createPage(values);
      } else {
        savePromise = updatePage(page.id, values);
      }
    }
    savePromise.catch((errorResponse) => {
      const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    }).then(() => {
      resetForm();
      setStatus('success');
    });
  }

  renderForm = (props) => {
    return (
      <>
        <PageForm
          {...props}
          mode="simple"
          hideTitle={this.props.slug !== 'information'}
          onPageFileAdd={this.handlePageFileOnAdd}
          onPageFileRemove={this.handlePageFileOnRemove}
          localPageFiles={this.state.localPageFiles}
        />
      </>
    );
  }

  render() {
    const { deployed } = this.state;
    const { className, slug, page } = this.props;

    return (
      <EditorWrapper className={`${className} e2e-page-editor editor-${slug}`}>
        <Toggle onClick={this.toggleDeploy} className={`${deployed && 'deployed'}`}>
          <DeployIcon name="chevron-right" />
          {messages[slug] ? <FormattedMessage {...messages[slug]} /> : slug}
        </Toggle>

          <CSSTransition
            in={deployed}
            timeout={timeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
            classNames="page"
          >
            <EditionForm>
              {page !== undefined &&
                <Formik
                  initialValues={this.initialValues()}
                  onSubmit={this.handleSubmit}
                  render={this.renderForm}
                  validate={PageForm.validate}
                  mode="new"
                  slug={slug}
                />
              }
            </EditionForm>
          </CSSTransition>
      </EditorWrapper>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  page: ({ params, render }) => <GetPage slug={params.slug}>{render}</GetPage>,
  remotePageFiles: ({ page, render }) => <GetResourceFileObjects resourceId={!isNilOrError(page) ? page.attributes.slug : null} resourceType="page">{render}</GetResourceFileObjects>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <PageEditor {...inputProps} {...dataProps} />}
  </Data>
));
