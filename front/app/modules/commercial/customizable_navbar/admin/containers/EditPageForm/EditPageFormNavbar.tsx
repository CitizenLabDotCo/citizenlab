import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import PageFormWithNavbarNameField, {
  FormValues,
} from '../../components/PageFormWithNavbarNameField';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { createPageUpdateData, getInitialFormValues } from './utils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// services
import { updatePage } from 'services/pages';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';
import useLocalize from 'hooks/useLocalize';

const EditPageFormNavbar = ({
  params: { pageId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
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

  const handleSubmit = async (values: FormValues) => {
    const localPageFiles = values.local_page_files;

    const promises: Promise<any>[] = [
      updatePage(pageId, createPageUpdateData(page, values)),
    ];

    if (!isNilOrError(localPageFiles)) {
      const addPromise = handleAddPageFiles(
        pageId,
        localPageFiles,
        remotePageFiles
      );
      const removePromise = handleRemovePageFiles(
        pageId,
        localPageFiles,
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
      <PageFormWithNavbarNameField
        pageId={pageId}
        onSubmit={handleSubmit}
        defaultValues={getInitialFormValues(page, remotePageFiles)}
      />
    </SectionFormWrapper>
  );
};

export default injectIntl(withRouter(EditPageFormNavbar));
