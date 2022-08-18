import React from 'react';
import { useParams } from 'react-router-dom';

// components
import PageForm, { FormValues } from 'components/PageForm';

// components
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useLocalize from 'hooks/useLocalize';

// services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';

const EditPageFormNotInNavbar = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { pageId } = useParams() as { pageId: string };
  const appConfigurationLocales = useAppConfigurationLocales();
  const localize = useLocalize();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

  if (isNilOrError(page) || isNilOrError(appConfigurationLocales)) {
    return null;
  }

  const handleSubmit = async ({
    local_page_files,
    ...pageUpdate
  }: FormValues) => {
    const promises: Promise<any>[] = [updatePage(pageId, pageUpdate)];

    if (!isNilOrError(local_page_files)) {
      const addPromise = handleAddPageFiles(
        pageId,
        local_page_files,
        remotePageFiles
      );
      const removePromise = handleRemovePageFiles(
        pageId,
        local_page_files,
        remotePageFiles
      );

      promises.push(addPromise, removePromise);
    }

    await Promise.all(promises);
  };

  return (
    <SectionFormWrapper
      title={localize(page.attributes.title_multiloc)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: localize(page.attributes.title_multiloc),
        },
      ]}
    >
      <PageForm
        pageId={pageId}
        onSubmit={handleSubmit}
        defaultValues={{
          title_multiloc: page.attributes.title_multiloc,
          body_multiloc: page.attributes.body_multiloc,
          slug: page.attributes.slug,
          local_page_files: remotePageFiles,
        }}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(EditPageFormNotInNavbar);
