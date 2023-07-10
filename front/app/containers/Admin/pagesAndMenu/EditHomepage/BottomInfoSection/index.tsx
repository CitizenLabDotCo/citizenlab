import useHomepageSettings from 'api/homepage_settings/useHomepageSettings';
import React from 'react';
import { IHomepageSettingsAttributes } from 'api/homepage_settings/types';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { homeBreadcrumb } from '../../breadcrumbs';
import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';
import useUpdateHomepageSettings from 'api/homepage_settings/useUpdateHomepageSettings';

const BottomInfoSection = () => {
  const { formatMessage } = useIntl();
  const { data: homepageSettings } = useHomepageSettings();
  const { mutateAsync: updateHomepageSettings } = useUpdateHomepageSettings();

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  const updateHomepageAndEnableSection = (
    data: Partial<IHomepageSettingsAttributes>
  ) => {
    return updateHomepageSettings({
      ...data,
      bottom_info_section_enabled: true,
    });
  };

  return (
    <GenericBottomInfoSection
      pageData={homepageSettings.data}
      updatePage={(data) => updateHomepageSettings(data)}
      updatePageAndEnableSection={(data) =>
        updateHomepageAndEnableSection(data)
      }
      breadcrumbs={[
        {
          label: formatMessage(homeBreadcrumb.label),
          linkTo: homeBreadcrumb.linkTo,
        },
      ]}
    />
  );
};

export default BottomInfoSection;
