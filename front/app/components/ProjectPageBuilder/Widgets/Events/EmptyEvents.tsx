import React from 'react';

import {
  Box,
  Icon,
  Title,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

// Builder-only: on the public page the events section simply disappears while
// the project has no events.
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
        <AdminOnlyNote message={messages.eventsEmptyNote} />
      </EmptyStateContainer>
    </Box>
  );
};

export default EmptyEvents;
