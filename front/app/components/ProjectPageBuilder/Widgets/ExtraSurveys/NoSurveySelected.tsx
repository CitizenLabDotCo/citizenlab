import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

const NoSurveySelected = () => (
  <EmptyStateContainer id="e2e-extra-surveys-empty">
    <Icon
      name="survey"
      width="32px"
      height="32px"
      fill={colors.textSecondary}
    />
    <Box display="flex" flexDirection="column" alignItems="center" gap="4px">
      <Text m="0px" fontWeight="bold" color="textPrimary">
        <FormattedMessage {...messages.extraSurveysNoSurveyTitle} />
      </Text>
      <Text m="0px" color="textSecondary" fontSize="s">
        <FormattedMessage {...messages.extraSurveysNoSurveyNote} />
      </Text>
    </Box>
    <AdminOnlyNote />
  </EmptyStateContainer>
);

export default NoSurveySelected;
