import React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';
import PageForm, { FormValues } from 'components/PageForm';

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

const NewPageForm = () => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const handleSubmit = async (values: FormValues) => {
    const localPageFiles = values.local_page_files;

    try {
      const page = await createPage(values);

      if (!isNilOrError(page) && !isNilOrError(localPageFiles)) {
        handleAddPageFiles(page.data.id, localPageFiles, null);
      }

      clHistory.push('/admin/pages');
    } catch {
      // Do nothing
    }
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
          <PageForm pageId={null} hideSlugInput onSubmit={handleSubmit} />
        </PageWrapper>
      </div>
    );
  }

  return null;
};

export default NewPageForm;
