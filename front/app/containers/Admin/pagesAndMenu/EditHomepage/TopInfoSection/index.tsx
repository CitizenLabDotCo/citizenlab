import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import useHomepageSettings from 'hooks/useHomepageSettings';
import {
  IHomepageSettingsAttributes,
  updateHomepageSettings,
} from 'services/homepageSettings';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import GenericTopInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericTopInfoSection';
import { homeBreadcrumb } from '../../breadcrumbs';

const TopInfoSection = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const homepageSettings = useHomepageSettings();
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

export default injectIntl(TopInfoSection);
