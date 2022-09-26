import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// components
import Outlet from 'components/Outlet';
import PageForm, { FormValues } from 'components/PageForm';

// components
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import useLocalize from 'hooks/useLocalize';
import { injectIntl, WrappedComponentProps } from 'react-intl';

// services
import { MAX_TITLE_LENGTH } from 'services/navbar';
import { handleAddPageFiles, handleRemovePageFiles } from 'services/pageFiles';
import { updatePage } from 'services/pages';

// hooks
import usePage from 'hooks/usePage';
import useRemoteFiles from 'hooks/useRemoteFiles';
import { truncateMultiloc } from 'utils/textUtils';

const EditPageForm = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const { pageId } = useParams() as { pageId: string };
  const localize = useLocalize();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });
  const [navbarModuleActive, setNavbarModuleActive] = useState(false);

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

  if (isNilOrError(page)) {
    return null;
  }

  return (
    <>
      <Outlet
        id="app.containers.Admin.pages-menu.containers.EditPageForm.index.onMount"
        onMount={() => setNavbarModuleActive(true)}
      />
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
            ...(page.relationships.nav_bar_item.data && {
              nav_bar_item_title_multiloc: truncateMultiloc(
                page.attributes.nav_bar_item_title_multiloc,
                MAX_TITLE_LENGTH
              ),
            }),
            title_multiloc: page.attributes.title_multiloc,
            body_multiloc: page.attributes.body_multiloc,
            slug: page.attributes.slug,
            local_page_files: remotePageFiles,
          }}
          hideSlugInput={!navbarModuleActive}
        />
      </SectionFormWrapper>
    </>
  );
};

export default injectIntl(EditPageForm);
