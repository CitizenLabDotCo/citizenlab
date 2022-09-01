import useHomepageSettings from 'hooks/useHomepageSettings';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { updateHomepageSettings } from 'services/homepageSettings';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { homeBreadcrumb } from '../../breadcrumbs';
import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';

const BottomInfoSection = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  if (isNilOrError(homepageSettings)) {
    return null;
  }

  return (
    <GenericBottomInfoSection
      pageData={homepageSettings}
      updatePage={(data) => updateHomepageSettings(data)}
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
