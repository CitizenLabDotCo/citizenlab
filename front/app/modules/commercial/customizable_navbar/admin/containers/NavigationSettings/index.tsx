import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import VisibleNavbarItemList from './VisibleNavbarItemList';
import HiddenNavbarItemList from './HiddenNavbarItemList';

// i18n
import messages from './messages';
import TabbedResource from 'components/admin/TabbedResource';

const NavigationSettings = ({ intl: { formatMessage } }: InjectedIntlProps) => (
  <TabbedResource
    resource={{
      title: formatMessage(messages.pageHeader),
      subtitle: formatMessage(messages.pageSubtitle),
    }}
  >
    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    <HiddenNavbarItemList />
  </TabbedResource>
);

export default injectIntl(NavigationSettings);
