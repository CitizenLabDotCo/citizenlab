import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ICustomPageAttributes, updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

const TopInfoSection = () => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);
  if (isNilOrError(customPage)) {
    return null;
  }

  const updateCustomPageAndEnableSection = (
    customPageId: string,
    data: Partial<ICustomPageAttributes>
  ) => {
    return updateCustomPage(customPageId, {
      ...data,
      top_info_section_enabled: true,
    });
  };

  return (
    <GenericTopInfoSection
      pageData={customPage.data}
      updatePage={(data) => updateCustomPage(customPageId, data)}
      updatePageAndEnableSection={(data) =>
        updateCustomPageAndEnableSection(customPageId, data)
      }
      breadcrumbs={[
        {
          label: localize(customPage.data.attributes.title_multiloc),
          linkTo: `/admin/pages-menu/pages/${customPageId}/content`,
        },
      ]}
      linkToViewPage={`/pages/${customPage.data.attributes.slug}`}
    />
  );
};

export default TopInfoSection;
