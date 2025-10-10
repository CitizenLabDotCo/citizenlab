import React from 'react';

import { useParams } from 'utils/router';

import { ICustomPageAttributes } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

import useLocalize from 'hooks/useLocalize';

import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';

import { isNilOrError } from 'utils/helperUtils';

const TopInfoSection = () => {
  const localize = useLocalize();
  const { mutateAsync: updateCustomPage } = useUpdateCustomPage();
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
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
      top_info_section_enabled: true,
    });
  };

  return (
    <GenericTopInfoSection
      pageData={customPage.data}
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

export default TopInfoSection;
