import useCustomPage from 'hooks/useCustomPage';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';
import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';

const TopInfoSection = () => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);
  if (isNilOrError(customPage)) {
    return null;
  }

  return (
    <GenericTopInfoSection
      pageData={customPage}
      updatePage={(data) => updateCustomPage(customPageId, data)}
      breadcrumbs={[
        {
          label: localize(customPage.attributes.title_multiloc),
          linkTo: `/admin/pages-menu/custom/${customPageId}/content`,
        },
      ]}
    />
  );
};

export default TopInfoSection;
