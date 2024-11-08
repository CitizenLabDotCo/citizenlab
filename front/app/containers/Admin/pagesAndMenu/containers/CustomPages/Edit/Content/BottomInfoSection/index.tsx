import React from 'react';

import { useParams } from 'react-router-dom';

import { ICustomPageAttributes } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

import useLocalize from 'hooks/useLocalize';

import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';

import { isNilOrError } from 'utils/helperUtils';

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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
