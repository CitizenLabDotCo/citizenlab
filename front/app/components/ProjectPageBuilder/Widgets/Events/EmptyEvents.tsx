import React from 'react';

import { Box, Icon, Title, colors } from '@citizenlab/cl2-component-library';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import messages from '../messages';

const EmptyEvents = () => {
  const padding = useCraftComponentDefaultPadding();

  return (
    <Box mx="auto" mt="48px" maxWidth={`${maxPageWidth}px`} px={padding}>
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
        <AdminOnlyNote message={messages.eventsEmptyMessage} />
      </EmptyStateContainer>
    </Box>
  );
};

export default EmptyEvents;
