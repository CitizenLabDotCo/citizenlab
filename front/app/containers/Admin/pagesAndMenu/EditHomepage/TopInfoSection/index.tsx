import useHomepageSettings from 'api/homepage_settings/useHomepageSettings';
import React from 'react';
import { IHomepageSettingsAttributes } from 'api/homepage_settings/types';
import { isNilOrError } from 'utils/helperUtils';
import { homeBreadcrumb } from '../../breadcrumbs';
import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';
import useUpdateHomepageSettings from 'api/homepage_settings/useUpdateHomepageSettings';
import { useIntl } from 'utils/cl-intl';

const TopInfoSection = () => {
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
      top_info_section_enabled: true,
    });
  };

  return (
    <GenericTopInfoSection
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

export default TopInfoSection;
