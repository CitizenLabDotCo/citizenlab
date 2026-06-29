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

import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

// Shown (to everyone, like the public events page) when the project has no
// upcoming or ongoing events yet.
const EmptyEvents = () => {
  const padding = useCraftComponentDefaultPadding();
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Box
      mx="auto"
      mt="48px"
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
      </EmptyStateContainer>
    </Box>
  );
};

export default EmptyEvents;
