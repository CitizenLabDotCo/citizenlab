import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import SkeletonBar from '../EmptyState/SkeletonBar';
import messages from '../messages';

const Dot = () => (
  <Box
    width="24px"
    height="24px"
    background={colors.grey200}
    borderRadius="50%"
  />
);

// Admin-only placeholder shown in the builder when the project has no phase with
// participation content to display yet.
const EmptyInputFeed = () => (
  <EmptyStateContainer>
    <Text m="0px" color="textSecondary" fontWeight="bold">
      <FormattedMessage {...messages.inputFeedEmptyTitle} />
    </Text>
    <Box width="100%" display="flex" flexDirection="column" gap="12px">
      <SkeletonBar height="40px" />
      <Box display="flex" alignItems="center" gap="8px">
        <Dot />
        <Dot />
        <Dot />
        <SkeletonBar />
      </Box>
    </Box>
    <AdminOnlyNote />
  </EmptyStateContainer>
);

export default EmptyInputFeed;
