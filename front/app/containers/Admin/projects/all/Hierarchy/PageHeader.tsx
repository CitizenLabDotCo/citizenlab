import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import NewProjectButton from '../NewProjectButton';

// The page title and its create button. The old page's header picks its button
// from the tab, which this page doesn't have.
const PageHeader = () => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Title>
      <FormattedMessage {...messages.overviewPageTitle} />
    </Title>
    <Box className="intercom-admin-projects-new-project-folder-buttons">
      <NewProjectButton />
    </Box>
  </Box>
);

export default PageHeader;
