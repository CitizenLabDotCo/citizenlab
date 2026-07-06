import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import SkeletonBar from '../EmptyState/SkeletonBar';
import messages from '../messages';

const Dot = () => (
  <Box
    flex="0 0 auto"
    width="20px"
    height="20px"
    background={colors.grey200}
    borderRadius="50%"
  />
);

type Props = {
  // Defaults to the "no phases yet" empty state; the widget passes the
  // "timeline hidden" variant when the legacy visibility rule hides it.
  titleMessage?: MessageDescriptor;
  noteMessage?: MessageDescriptor;
};

// Admin-only placeholder shown when the timeline has nothing to render on the
// public page, so the widget can still be seen and positioned in the builder.
const EmptyTimeline = ({
  titleMessage = messages.timelineEmptyTitle,
  noteMessage,
}: Props) => {
  const padding = useCraftComponentDefaultPadding();

  return (
    <Box maxWidth="1000px" margin="0 auto" px={padding}>
      <Title variant="h2" color="tenantText" mb="20px">
        <FormattedMessage {...messages.phasesHeading} />
      </Title>
      <EmptyStateContainer>
        <Text m="0px" color="textSecondary" fontWeight="bold">
          <FormattedMessage {...titleMessage} />
        </Text>
        <Box width="100%" display="flex" alignItems="center" gap="8px">
          <Dot />
          <SkeletonBar height="2px" />
          <Dot />
          <SkeletonBar height="2px" />
          <Dot />
        </Box>
        <Box width="100%" display="flex" flexDirection="column" gap="10px">
          <SkeletonBar />
          <SkeletonBar width="80%" />
        </Box>
        <AdminOnlyNote message={noteMessage} />
      </EmptyStateContainer>
    </Box>
  );
};

export default EmptyTimeline;
