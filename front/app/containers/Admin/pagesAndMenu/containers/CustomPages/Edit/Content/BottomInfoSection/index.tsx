import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';
import useCustomPage from 'hooks/useCustomPage';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ICustomPageAttributes, updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';

const BottomInfoSection = () => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

  if (isNilOrError(customPage)) {
    return null;
  }

  const updateCustomPageAndEnableSection = (
    customPageId: string,
    data: Partial<ICustomPageAttributes>
  ) => {
    return updateCustomPage(customPageId, {
      ...data,
      bottom_info_section_enabled: true,
    });
  };

  return (
    <GenericBottomInfoSection
      pageData={customPage}
      updatePage={(data) => updateCustomPage(customPageId, data)}
      updatePageAndEnableSection={(data) =>
        updateCustomPageAndEnableSection(customPageId, data)
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

export default BottomInfoSection;
