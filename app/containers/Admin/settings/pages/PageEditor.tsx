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
import { addPageFile, deletePageFile } from 'services/pageFiles';

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
import { CLErrorsJSON } from 'typings';

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
      localPageFiles: null,
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
    const { page, remotePageFiles } = this.props;
    let initialValues = {};

    if (!isNilOrError(page)) {
      initialValues = {
        title_multiloc: page.attributes.title_multiloc,
        slug: page.attributes.slug,
        body_multiloc: page.attributes.body_multiloc,
      };
    } else {
      initialValues = {
        title_multiloc: { en: this.props.slug },
        body_multiloc: {},
      };
    }

    if (!isNilOrError(remotePageFiles)) {
      initialValues['local_page_files'] = remotePageFiles;
    } else {
      initialValues['local_page_files'] = [];
    }

    return initialValues;
  }

  getFilesToAddPromises = (values: FormValues) => {
    const { local_page_files } = values;
    const localPageFiles = [...local_page_files];
    const { page, remotePageFiles } = this.props;
    const pageId = !isNilOrError(page) ? page.id : null;
    let filesToAdd = localPageFiles;
    let filesToAddPromises: Promise<any>[] = [];

    if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
      // localPageFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remotePageFiles = last saved state of files (remote)

      filesToAdd = localPageFiles.filter((localPageFile) => {
        return !remotePageFiles.some(remotePageFile => remotePageFile.filename === localPageFile.filename);
      });
    }

    if (pageId && !isNilOrError(filesToAdd) && filesToAdd.length > 0) {
      filesToAddPromises = filesToAdd.map((fileToAdd: any) => addPageFile(pageId as string, fileToAdd.base64, fileToAdd.name));
    }

    return filesToAddPromises;
  }

  getFilesToRemovePromises = (values: FormValues) => {
    const { local_page_files } = values;
    const localPageFiles = [...local_page_files];
    const { page, remotePageFiles } = this.props;
    const pageId = !isNilOrError(page) ? page.id : null;
    let filesToRemove = remotePageFiles;
    let filesToRemovePromises: Promise<any>[] = [];

    if (!isNilOrError(localPageFiles) && Array.isArray(remotePageFiles)) {
      // localPageFiles = local state of files
      // This means those previously uploaded + files that have been added/removed
      // remotePageFiles = last saved state of files (remote)

      filesToRemove = remotePageFiles.filter((remotePageFile) => {
        return !localPageFiles.some(localPageFile => localPageFile.filename === remotePageFile.filename);
      });
    }

    if (pageId && !isNilOrError(filesToRemove) && filesToRemove.length > 0) {
      filesToRemovePromises = filesToRemove.map((fileToRemove: any) => deletePageFile(pageId as string, fileToRemove.id));
    }

    return filesToRemovePromises;
  }

  handleSubmit = async (values: FormValues, { setSubmitting, setErrors, setStatus, resetForm }) => {
    const { page } = this.props;
    const { slug, title_multiloc, body_multiloc  } = values;
    const fieldValues = { slug, title_multiloc, body_multiloc };
    let savePromise: Promise<IPage> | null = null;
    const filesToAddPromises: Promise<any>[] = this.getFilesToAddPromises(values);
    const filesToRemovePromises: Promise<any>[] = this.getFilesToRemovePromises(values);
    const filePromises = [
      ...filesToAddPromises,
      ...filesToRemovePromises
    ];

    if (page === undefined) {
      return;
    } else {
      setSubmitting(true);
      setStatus(null);
      if (isNilOrError(page)) {
        savePromise = createPage(fieldValues);
      } else {
        savePromise = updatePage(page.id, fieldValues);
      }
    }

    try {
      await savePromise;
      await Promise.all(filePromises);
      resetForm();
      setStatus('success');
    } catch (errorResponse) {
      const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    }
  }

  renderForm = (props) => {
    return (
      <>
        <PageForm
          {...props}
          mode="simple"
          hideTitle={this.props.slug !== 'information'}
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
  page: ({ slug, render }) => <GetPage slug={slug}>{render}</GetPage>,
  remotePageFiles: ({ page, render }) => <GetResourceFileObjects resourceId={!isNilOrError(page) ? page.id : null} resourceType="page">{render}</GetResourceFileObjects>
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <PageEditor {...inputProps} {...dataProps} />}
  </Data>
));
