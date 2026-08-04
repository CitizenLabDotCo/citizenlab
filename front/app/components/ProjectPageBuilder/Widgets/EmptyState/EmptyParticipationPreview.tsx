import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import AdminOnlyNote from './AdminOnlyNote';
import EmptyStateContainer from './EmptyStateContainer';
import SkeletonBar from './SkeletonBar';
import SkeletonDot from './SkeletonDot';

const EmptyParticipationPreview = () => (
  <EmptyStateContainer>
    <Text m="0px" color="textSecondary" fontWeight="bold">
      <FormattedMessage {...messages.inputFeedEmptyTitle} />
    </Text>
    <Box width="100%" display="flex" flexDirection="column" gap="12px">
      <SkeletonBar height="40px" />
      <Box display="flex" alignItems="center" gap="8px">
        <SkeletonDot size="24px" />
        <SkeletonDot size="24px" />
        <SkeletonDot size="24px" />
        <SkeletonBar />
      </Box>
    </Box>
    <AdminOnlyNote />
  </EmptyStateContainer>
);

export default EmptyParticipationPreview;
