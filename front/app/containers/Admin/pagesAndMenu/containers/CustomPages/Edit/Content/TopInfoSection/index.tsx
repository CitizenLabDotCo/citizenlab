import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';
import useCustomPage from 'hooks/useCustomPage';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

const TopInfoSection = () => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);
  if (isNilOrError(customPage)) {
    return null;
  }

  const updateCustomPageAndEnableSection = (customPageId, data) => {
    return updateCustomPage(customPageId, {
      ...data,
      top_info_section_enabled: true,
    });
  };

  return (
    <GenericTopInfoSection
      pageData={customPage}
      updatePage={(data) => updateCustomPage(customPageId, data)}
      updatePageAndEnableSection={
        customPage.attributes.top_info_section_enabled
          ? undefined // matches the type for an optional parameter
          : (data) => updateCustomPageAndEnableSection(customPageId, data)
      }
      breadcrumbs={[
        {
          label: localize(customPage.attributes.title_multiloc),
          linkTo: `/admin/pages-menu/pages/${customPageId}/content`,
        },
      ]}
      linkToViewPage={`/pages/${customPage.attributes.slug}`}
    />
  );
};

export default TopInfoSection;
