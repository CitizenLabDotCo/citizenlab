import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ICustomPageAttributes } from 'api/custom_pages/types';
import { isNilOrError } from 'utils/helperUtils';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

const BottomInfoSection = () => {
  const localize = useLocalize();
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  const updateCustomPageAndEnableSection = (
    customPageId: string,
    data: Partial<ICustomPageAttributes>
  ) => {
    return updateCustomPage({
      id: customPageId,
      ...data,
      bottom_info_section_enabled: true,
    });
  };

  return (
    <GenericBottomInfoSection
      pageData={customPage?.data}
      updatePage={(data) => updateCustomPage({ id: customPageId, ...data })}
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

export default BottomInfoSection;
