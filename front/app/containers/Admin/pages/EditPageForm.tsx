import React from 'react';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik, FormikProps } from 'formik';

// components
import PageForm, { validatePageForm, FormValues } from 'components/PageForm';
import PageWrapper from 'components/admin/PageWrapper';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';
import { CLErrorsJSON } from 'typings';

// services
import { updatePage, IPageData } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles, { useRemoteFilesOutput } from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

interface Props {}

const EditPageForm = ({ params: { pageId } }: Props & WithRouterProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const getInitialValues = (
    page: IPageData,
    remotePageFiles: useRemoteFilesOutput
  ): FormValues => {
    return {
      title_multiloc: page.attributes.title_multiloc,
      body_multiloc: page.attributes.body_multiloc,
      slug: page.attributes.slug,
      local_page_files: !isNilOrError(remotePageFiles) ? remotePageFiles : null,
    };
  };

  const handleSubmit = (
    page: IPageData,
    remotePageFiles: useRemoteFilesOutput
  ) => async (values: FormValues, { setErrors, setSubmitting, setStatus }) => {
    const localPageFiles = values.local_page_files;
    const pageId = page.id;

    try {
      await updatePage(pageId, {
        ...getInitialValues(page, remotePageFiles),
        ...values,
      });

      handleAddPageFiles(pageId, localPageFiles, remotePageFiles);
      handleRemovePageFiles(pageId, localPageFiles, remotePageFiles);

      setStatus('success');
      setSubmitting(false);
    } catch (error) {
      if (isCLErrorJSON(error)) {
        const apiErrors = (error as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    clHistory.push('/admin/pages');
  };

  const renderFn = (pageId: string) => (props: FormikProps<FormValues>) => {
    return <PageForm {...props} mode="edit" pageId={pageId} />;
  };

  if (!isNilOrError(page) && !isNilOrError(appConfigurationLocales)) {
    const initialValues = getInitialValues(page, remotePageFiles);
    const pageId = page.id;
    const validate = validatePageForm(appConfigurationLocales);

    return (
      <div>
        <GoBackButton onClick={handleGoBack} />
        <Title>
          <T value={page.attributes.title_multiloc} />
        </Title>
        <PageWrapper>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit(page, remotePageFiles)}
            render={renderFn(pageId)}
            validate={validate}
          />
        </PageWrapper>
      </div>
    );
  }

  return null;
};

export default withRouter(EditPageForm);
