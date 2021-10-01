// Libraries
import React, { useState, lazy, Suspense } from 'react';
import { Formik, FormikProps } from 'formik';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Components
import { Icon } from 'cl2-component-library';
import { FormValues, validatePageForm } from 'components/PageForm';
const PageForm = lazy(() => import('components/PageForm'));

// Services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles, { useRemoteFilesOutput } from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// Typings
import { CLErrorsJSON } from 'typings';
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

interface Props {
  className?: string;
  pageSlug: string;
}

const PageEditor = ({ className, pageSlug }: Props) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const page = usePage({ pageSlug });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const [expanded, setExpanded] = useState(false);
  const toggleDeploy = () => {
    setExpanded((expanded) => !expanded);
  };

  const handleSubmit = (
    pageId: string,
    remotePageFiles: useRemoteFilesOutput
  ) => async (
    { slug, title_multiloc, body_multiloc, local_page_files }: FormValues,
    { setSubmitting, setErrors, setStatus }
  ) => {
    try {
      const fieldValues = { slug, title_multiloc, body_multiloc };
      await updatePage(pageId, fieldValues);

      if (!isNilOrError(local_page_files)) {
        handleAddPageFiles(pageId, local_page_files, remotePageFiles);
        handleRemovePageFiles(pageId, local_page_files, remotePageFiles);
      }

      setStatus('success');
      setSubmitting(false);
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

  if (!isNilOrError(page) && !isNilOrError(appConfigurationLocales)) {
    const pageId = page.id;

    return (
      <EditorWrapper
        className={`${className} e2e-page-editor editor-${pageSlug}`}
      >
        <Toggle onClick={toggleDeploy} className={`${expanded && 'deployed'}`}>
          <DeployIcon name="chevron-right" />
          {messages[pageSlug] ? (
            <FormattedMessage {...messages[pageSlug]} />
          ) : (
            pageSlug
          )}
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
              initialValues={{
                title_multiloc: page.attributes.title_multiloc,
                body_multiloc: page.attributes.body_multiloc,
                slug: page.attributes.slug,
                local_page_files: remotePageFiles,
              }}
              onSubmit={handleSubmit(pageId, remotePageFiles)}
              validate={validatePageForm(appConfigurationLocales)}
              validateOnChange={false}
              validateOnBlur={false}
            >
              {(props: FormikProps<FormValues>) => {
                return (
                  <Suspense fallback={null}>
                    <PageForm
                      {...props}
                      slug={pageSlug}
                      pageId={pageId}
                      hideTitle={pageSlug !== 'information'}
                      hideSlugInput
                    />
                  </Suspense>
                );
              }}
            </Formik>
          </EditionForm>
        </CSSTransition>
      </EditorWrapper>
    );
  }

  return null;
};

export default PageEditor;
