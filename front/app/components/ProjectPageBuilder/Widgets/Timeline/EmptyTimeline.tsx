import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';

import AdminOnlyNote from '../EmptyState/AdminOnlyNote';
import EmptyStateContainer from '../EmptyState/EmptyStateContainer';
import SkeletonBar from '../EmptyState/SkeletonBar';
import SkeletonDot from '../EmptyState/SkeletonDot';
import messages from '../messages';

type Props = {
  titleMessage?: MessageDescriptor;
  noteMessage?: MessageDescriptor;
};

// Admin-only placeholder keeping the widget visible when the timeline has
// nothing to render on the public page.
const EmptyTimeline = ({
  titleMessage = messages.timelineEmptyTitle,
  noteMessage,
}: Props) => {
  const padding = useCraftComponentDefaultPadding();

  return (
    <Box maxWidth={`${maxPageWidth}px`} margin="0 auto" px={padding}>
      <Title variant="h2" color="tenantText" mb="20px">
        <FormattedMessage {...messages.phasesHeading} />
      </Title>
      <EmptyStateContainer>
        <Text m="0px" color="textSecondary" fontWeight="bold">
          <FormattedMessage {...titleMessage} />
        </Text>
        <Box width="100%" display="flex" alignItems="center" gap="8px">
          <SkeletonDot />
          <SkeletonBar height="2px" />
          <SkeletonDot />
          <SkeletonBar height="2px" />
          <SkeletonDot />
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
