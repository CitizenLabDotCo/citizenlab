import React from 'react';

// services
import { handleAddPageFiles } from 'services/pageFiles';
import { createPage } from 'services/pages';

// components
import PageForm, { FormValues } from 'components/PageForm';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

const NewPageForm = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const goBack = () => {
    clHistory.push(ADMIN_PAGES_MENU_PATH);
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
