import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

const EmptyBanner = () => (
  <Box id="e2e-project-page-banner" mb="24px">
    <EmptyStateContainer>
      <Icon
        name="image"
        width="32px"
        height="32px"
        fill={colors.textSecondary}
      />
      <Text m="0px" color="textSecondary" fontWeight="bold">
        <FormattedMessage {...messages.bannerEmptyTitle} />
      </Text>
      <AdminOnlyNote message={messages.bannerEmptyNote} />
    </EmptyStateContainer>
  </Box>
);

export default EmptyBanner;
