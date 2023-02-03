import useHomepageSettings from 'hooks/useHomepageSettings';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { homeBreadcrumb } from '../../breadcrumbs';
import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';

const BottomInfoSection = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const homepageSettings = useHomepageSettings();
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
      pageData={homepageSettings}
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

export default injectIntl(BottomInfoSection);
