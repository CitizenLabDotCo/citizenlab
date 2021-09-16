// Libraries
import React, { PureComponent } from 'react';
import { Formik, FormikProps } from 'formik';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Components
import { Icon } from 'cl2-component-library';
import PageForm, { FormValues, validatePageForm } from 'components/PageForm';

// Services
import { updatePage } from 'services/pages';
import {
  getPageFilesToRemovePromises,
  getPageFilesToAddPromises,
} from 'services/pageFiles';

// Resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// Typings
import { CLErrorsJSON, UploadFile } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

const timeout = 350;

const EditorWrapper = styled.div`
  margin-bottom: 35px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const DeployIcon = styled(Icon)`
  height: 12px;
  width: 8px;
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
  expanded: boolean;
}

class PageEditor extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  toggleDeploy = () => {
    this.setState(({ expanded }) => ({ expanded: !expanded }));
  };

  initialValues = () => {
    const { page, remotePageFiles, slug } = this.props;
    const initialValues = {};

    if (!isNilOrError(page)) {
      initialValues['title_multiloc'] = page.attributes.title_multiloc;
      initialValues['body_multiloc'] = page.attributes.body_multiloc;
      initialValues['slug'] = page.attributes.slug;
    } else {
      initialValues['title_multiloc'] = {
        en: slug,
      };
      initialValues['body_multiloc'] = {};
    }

    if (!isNilOrError(remotePageFiles)) {
      initialValues['local_page_files'] = remotePageFiles;
    } else {
      initialValues['local_page_files'] = [];
    }

    return initialValues;
  };

  handleSubmit = (pageId: string, remotePageFiles: UploadFile[]) => async (
    { slug, title_multiloc, body_multiloc, local_page_files }: FormValues,
    { setSubmitting, setErrors, setStatus, resetForm }
  ) => {
    try {
      const fieldValues = { slug, title_multiloc, body_multiloc };
      await updatePage(pageId, fieldValues);

      if (!isNilOrError(local_page_files)) {
        const filesToAddPromises = getPageFilesToAddPromises(
          pageId,
          local_page_files,
          remotePageFiles
        );
        const filesToRemovePromises = getPageFilesToRemovePromises(
          pageId,
          local_page_files,
          remotePageFiles
        );
        await Promise.all(filesToAddPromises);
        await Promise.all(filesToRemovePromises);
      }
      setTimeout(() => {
        resetForm();
        setStatus('success');
      }, 50);
    } catch (errorResponse) {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    }
  };

  render() {
    const { expanded } = this.state;
    const { className, slug, page, remotePageFiles } = this.props;

    if (!isNilOrError(page) && !isNilOrError(remotePageFiles)) {
      const pageId = page.id;

      return (
        <EditorWrapper
          className={`${className} e2e-page-editor editor-${slug}`}
        >
          <Toggle
            onClick={this.toggleDeploy}
            className={`${expanded && 'deployed'}`}
          >
            <DeployIcon name="chevron-right" />
            {messages[slug] ? <FormattedMessage {...messages[slug]} /> : slug}
          </Toggle>

          <CSSTransition
            in={expanded}
            timeout={timeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
            classNames="page"
          >
            <EditionForm>
              <Formik
                initialValues={this.initialValues()}
                enableReinitialize={true}
                validateOnChange={false}
                validateOnBlur={false}
                onSubmit={this.handleSubmit(pageId, remotePageFiles)}
                validate={validatePageForm}
              >
                {(props: FormikProps<FormValues>) => {
                  return (
                    <PageForm
                      {...props}
                      slug={slug}
                      mode="simple"
                      hideTitle={slug !== 'information'}
                      pageId={pageId}
                    />
                  );
                }}
              </Formik>
            </EditionForm>
          </CSSTransition>
        </EditorWrapper>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  page: ({ slug, render }) => <GetPage slug={slug}>{render}</GetPage>,
  remotePageFiles: ({ page, render }) => (
    <GetResourceFileObjects
      resourceId={!isNilOrError(page) ? page.id : null}
      resourceType="page"
    >
      {render}
    </GetResourceFileObjects>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PageEditor {...inputProps} {...dataProps} />}
  </Data>
));
