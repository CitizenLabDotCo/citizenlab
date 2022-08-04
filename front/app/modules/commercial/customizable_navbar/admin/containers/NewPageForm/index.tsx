import React from 'react';

// services
import { createPage } from 'services/pages';
import { handleAddPageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import usePageSlugs from 'hooks/usePageSlugs';

// components
import PageForm, { FormValues } from 'components/PageForm';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

const NewPageForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  const pageSlugs = usePageSlugs();

  if (isNilOrError(appConfigurationLocales) || isNilOrError(pageSlugs)) {
    return null;
  }

  const goBack = () => {
    clHistory.push(PAGES_MENU_PATH);
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
    <SectionFormWrapper
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(messages.addPageButton),
        },
      ]}
      title={<FormattedMessage {...messages.addPageButton} />}
    >
      <PageForm onSubmit={handleSubmit} hideSlugInput pageId={null} />
    </SectionFormWrapper>
  );
};

export default injectIntl(NewPageForm);
