import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

import GetPage, { GetPageChildProps } from 'resources/GetPage';
import PageForm, { validatePageForm, FormValues } from 'components/PageForm';
import { Formik, FormikValues, FormikProps } from 'formik';
import PageWrapper from 'components/admin/PageWrapper';
import { fontSizes } from 'utils/styleUtils';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';
import { CLErrorsJSON } from 'typings';

// services
import { updatePage } from 'services/pages';
import { addPageFile, deletePageFile } from 'services/pageFiles';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

interface InputProps {}

interface DataProps {
  page: GetPageChildProps;
  remotePageFiles: GetResourceFileObjectsChildProps;
}

interface Props extends InputProps, DataProps {}

const EditPageForm = ({ page, remotePageFiles }: Props & WithRouterProps) => {
  const getInitialValues = () => {
    if (!isNilOrError(page) && !isNilOrError(remotePageFiles)) {
      return {
        title_multiloc: page.attributes.title_multiloc,
        body_multiloc: page.attributes.body_multiloc,
        slug: page.attributes.slug,
        local_page_files: remotePageFiles,
      };
    }

    return null;
  };

  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'
  const handleSubmit = async (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    if (!isNilOrError(page)) {
      const pageId = page.id;
      try {
        const filesToAddPromises = pageFiles
          .filter((file) => !file.remote)
          .map((file) => {
            addPageFile(pageId, file.base64, file.name);
          });

        const filesToRemovePromises = pageFiles
          .filter((file) => !file.remote)
          .map((file) => {
            deletePageFile(pageId, file.id);
          });

        await updatePage(pageId, {
          ...getInitialValues(),
          ...values,
        });
        await Promise.all([...filesToAddPromises, ...filesToRemovePromises]);
        clHistory.push('/admin/pages');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);

        if (isCLErrorJSON(error)) {
          const apiErrors = (error as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      }
    }
  };

  const handleGoBack = () => {
    clHistory.push('/admin/pages');
  };

  const renderFn = (pageId: string) => (props: FormikProps<FormikValues>) => {
    return (
      <PageForm {...props} mode="edit" pageId={pageId} pageFiles={pageFiles} />
    );
  };

  if (!isNilOrError(page)) {
    const initialValues = getInitialValues();
    const pageId = page.id;

    return (
      <>
        <GoBackButton onClick={handleGoBack} />
        <Title>
          <T value={page.attributes.title_multiloc} />
        </Title>
        <PageWrapper>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            render={renderFn(pageId)}
            validate={validatePageForm}
          />
        </PageWrapper>
      </>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  page: ({ params: { pageId }, render }) => (
    <GetPage id={pageId}>{render}</GetPage>
  ),
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
    {(dataProps: DataProps) => <EditPageForm {...inputProps} {...dataProps} />}
  </Data>
));
