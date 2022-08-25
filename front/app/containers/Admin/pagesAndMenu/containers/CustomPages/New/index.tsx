import React from 'react';
import CustomPageSettingsForm from '../CustomPageSettingsForm';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import HelmetIntl from 'components/HelmetIntl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

const CustomPagesNewSettings = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  return (
    <>
      <HelmetIntl
        title={messages.newCustomPageMetaTitle}
        description={messages.newCustomPageMetaDescription}
      />
      {/* Title will come as part of TabbedResource */}
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            { label: formatMessage(messages.newCustomPagePageTitle) },
          ]}
        />
      </Box>
      <CustomPageSettingsForm />
    </>
  );
};

export default injectIntl(CustomPagesNewSettings);
