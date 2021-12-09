import React from 'react';
import styled from 'styled-components';
import { Locale } from 'typings';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import PageForm, { FormValues, validatePageForm } from 'components/PageForm';
import { Formik, FormikProps } from 'formik';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { createPage } from 'services/pages';
import { handleAddPageFiles } from 'services/pageFiles';

import { isNilOrError } from 'utils/helperUtils';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

export interface Props {}

const NewPageForm = (_props: Props) => {
  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'
  const appConfigurationLocales = useAppConfigurationLocales();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setStatus }
  ) => {
    const localPageFiles = values.local_page_files;

    try {
      const page = await createPage(values);

      if (!isNilOrError(page) && !isNilOrError(localPageFiles)) {
        handleAddPageFiles(page.data.id, localPageFiles, null);
      }

      clHistory.push('/admin/pages');
    } catch (error) {
      setStatus('error');
      setSubmitting(false);
    }
  };

  const getInitialValues = (appConfigurationLocales: Locale[]): FormValues => {
    const titleMultiloc = {};
    const bodyMultiloc = {};

    appConfigurationLocales.forEach((locale) => {
      titleMultiloc[locale] = '';
      bodyMultiloc[locale] = '';
    });

    return {
      title_multiloc: titleMultiloc,
      body_multiloc: bodyMultiloc,
      local_page_files: null,
    };
  };

  const renderFn = (props: FormikProps<FormValues>) => {
    return <PageForm {...props} pageId={null} />;
  };

  const goBack = () => {
    clHistory.push('/admin/pages');
  };

  if (!isNilOrError(appConfigurationLocales)) {
    return (
      <div>
        <GoBackButton onClick={goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addPageButton} />
        </PageTitle>
        <PageWrapper>
          <Formik
            initialValues={getInitialValues(appConfigurationLocales)}
            onSubmit={handleSubmit}
            render={renderFn}
            validate={validatePageForm(appConfigurationLocales)}
            validateOnChange={false}
            validateOnBlur={false}
          />
        </PageWrapper>
      </div>
    );
  }

  return null;
};

export default NewPageForm;
