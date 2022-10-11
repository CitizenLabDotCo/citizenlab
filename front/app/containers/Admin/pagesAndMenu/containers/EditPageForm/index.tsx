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
import { MAX_TITLE_LENGTH } from 'services/navbar';

// hooks
import useRemoteFiles from 'hooks/useRemoteFiles';
import usePage from 'hooks/usePage';
import { truncateMultiloc } from 'utils/textUtils';

const EditPageForm = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { pageId } = useParams() as { pageId: string };
  const localize = useLocalize();
  const page = usePage({ pageId });
  const remotePageFiles = useRemoteFiles({
    resourceType: 'page',
    resourceId: !isNilOrError(page) ? page.id : null,
  });

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
            top_info_section_multiloc:
              page.attributes.top_info_section_multiloc,
            slug: page.attributes.slug,
            local_page_files: remotePageFiles,
          }}
        />
      </SectionFormWrapper>
    </>
  );
};

export default injectIntl(EditPageForm);
