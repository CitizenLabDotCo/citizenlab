import GenericBottomInfoSection from 'containers/Admin/pagesAndMenu/containers/GenericBottomInfoSection';
import useHomepageSettings from 'hooks/useHomepageSettings';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { updateHomepageSettings } from 'services/homepageSettings';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { homeBreadcrumb } from '../../breadcrumbs';

const BottomInfoSection = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
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
