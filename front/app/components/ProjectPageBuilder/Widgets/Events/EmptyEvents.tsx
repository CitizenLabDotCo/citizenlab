import React from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import sharedMessages from 'utils/messages';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

// Admin-only placeholder shown in the builder when the project has no events yet.
const EmptyEvents = () => {
  const padding = useCraftComponentDefaultPadding();
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Box
      mx="auto"
      maxWidth={`${maxPageWidth}px`}
      px={isSmallerThanTablet ? '20px' : padding}
    >
      <Title variant="h2" color="tenantText" mb="20px">
        <FormattedMessage {...messages.eventsWidgetTitle} />
      </Title>
      <EmptyStateContainer>
        <Icon
          name="calendar"
          width="32px"
          height="32px"
          fill={colors.textSecondary}
        />
        <Text m="0px" color="textSecondary">
          <FormattedMessage {...sharedMessages.noUpcomingOrOngoingEvents} />
        </Text>
        <AdminOnlyNote />
      </EmptyStateContainer>
    </Box>
  );
};

export default EmptyEvents;
