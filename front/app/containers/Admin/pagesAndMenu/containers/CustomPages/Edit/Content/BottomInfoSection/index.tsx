import useCustomPage from 'hooks/useCustomPage';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { updateCustomPage } from 'services/customPages';
import { isNilOrError } from 'utils/helperUtils';
import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';

const BottomInfoSection = () => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  const updateAndEnableCustomPage = (customPageId, data) => {
    return updateCustomPage(customPageId, {
      ...data,
      bottom_info_section_enabled: true,
    });
  };

  return (
    <GenericBottomInfoSection
      pageData={customPage}
      updatePage={(data) => updateCustomPage(customPageId, data)}
      updateAndEnablePage={(data) =>
        updateAndEnableCustomPage(customPageId, data)
      }
      breadcrumbs={[
        {
          label: localize(customPage.attributes.title_multiloc),
          linkTo: `/admin/pages-menu/pages/${customPageId}/content`,
        },
      ]}
    />
  );
};

export default BottomInfoSection;
