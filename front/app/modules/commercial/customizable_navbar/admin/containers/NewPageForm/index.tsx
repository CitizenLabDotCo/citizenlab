import React from 'react';
import styled from 'styled-components';

// services
import { createPage } from 'services/pages';
import { handleAddPageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import usePageSlugs from 'hooks/usePageSlugs';

// components
import GoBackButton from 'components/UI/GoBackButton';
import PageForm, { FormValues } from 'components/PageForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { NAVIGATION_PATH } from '..';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

const NewPageForm = () => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const pageSlugs = usePageSlugs();

  if (isNilOrError(appConfigurationLocales) || isNilOrError(pageSlugs)) {
    return null;
  }

  const goBack = () => {
    clHistory.push(NAVIGATION_PATH);
  };

  const handleSubmit = async (values: FormValues) => {
    const localPageFiles = values.local_page_files;

    const page = await createPage(values);

    if (!isNilOrError(page) && !isNilOrError(localPageFiles)) {
      await handleAddPageFiles(page.data.id, localPageFiles, null);
    }

    goBack();
  };

  return (
    <div>
      <GoBackButton onClick={goBack} />
      <PageTitle>
        <FormattedMessage {...messages.addPageButton} />
      </PageTitle>
      <PageForm onSubmit={handleSubmit} hideSlugInput pageId={null} />
    </div>
  );
};

export default NewPageForm;
