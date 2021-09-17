import React from 'react';
import styled from 'styled-components';
import { CLErrorsJSON } from 'typings';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import PageForm, { FormValues, validatePageForm } from 'components/PageForm';
import { Formik, FormikProps } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { createPage } from 'services/pages';
import { getPageFilesToAddPromises } from 'services/pageFiles';

import { isCLErrorJSON } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

export interface Props {}

const NewPageForm = (_props: Props) => {
  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'

  const handleSubmit = async (
    values: FormValues,
    { setErrors, setSubmitting, setStatus }
  ) => {
    // still to check types
    // shouldn't need isNilOrError check below
    const localPageFiles = values.local_page_files;

    try {
      const page = await createPage({
        ...values,
      });

      if (!isNilOrError(page) && !isNilOrError(localPageFiles)) {
        const filesToAddPromises = getPageFilesToAddPromises(
          page.data.id,
          localPageFiles,
          null
        );

        if (filesToAddPromises) {
          await Promise.all([...filesToAddPromises]);
        }
      }

      clHistory.push('/admin/pages');
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

  const getInitialValues = (): FormValues => {
    return {
      title_multiloc: {},
      body_multiloc: {},
      local_page_files: [],
    };
  };

  const renderFn = (props: FormikProps<FormValues>) => {
    return <PageForm {...props} mode="simple" pageId={null} />;
  };

  const goBack = () => {
    clHistory.push('/admin/pages');
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addPageButton} />
      </PageTitle>
      <PageWrapper>
        <Formik
          initialValues={getInitialValues()}
          onSubmit={handleSubmit}
          render={renderFn}
          validate={validatePageForm}
        />
      </PageWrapper>
    </div>
  );
};

export default NewPageForm;
