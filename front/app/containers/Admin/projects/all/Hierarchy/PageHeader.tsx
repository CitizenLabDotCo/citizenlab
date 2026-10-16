import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import HeaderBar, {
  HEADER_BAR_INSET,
} from '../../_shared/components/HeaderBar';
import messages from '../messages';

import { PAGE_SIDE_PADDING } from './constants';
import NewMenu from './NewMenu';

// The page title and its create button, in the header bar, where the project
// page has its main buttons.
// The old page's header picks its button from the tab, which this page doesn't
// have.
const PageHeader = () => (
  // The bar sits in from the page's edges, so the title starts that much less
  // inside it to line up with the levels below.
  <HeaderBar startPadding={`calc(${PAGE_SIDE_PADDING} - ${HEADER_BAR_INSET})`}>
    <Title m="0">
      <FormattedMessage {...messages.overviewPageTitle} />
    </Title>
    <Box
      ml="auto"
      className="intercom-admin-projects-new-project-folder-buttons"
    >
      <NewMenu />
    </Box>
  </HeaderBar>
);

export default PageHeader;
