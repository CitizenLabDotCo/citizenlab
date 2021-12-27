import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

// components
import {
  Section,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';
import VisibleNavbarItemList from './VisibleNavbarItemList';
import HiddenNavbarItemList from './HiddenNavbarItemList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const NavigationSettings = () => (
  <Section>
    <SectionTitle>
      <FormattedMessage {...messages.pageTitle} />
    </SectionTitle>

    <SectionDescription>
      <FormattedMessage {...messages.pageSubtitle} />
    </SectionDescription>

    <Box mb="44px">
      <VisibleNavbarItemList />
    </Box>

    <HiddenNavbarItemList />
  </Section>
);

export default injectIntl(NavigationSettings);
