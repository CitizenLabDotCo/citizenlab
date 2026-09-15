import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import { useIsInBuilderCanvas } from 'components/admin/ContentBuilder/context/BuilderCanvasContext';
import Warning from 'components/UI/Warning';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

interface Props {
  title: string;
  explanation: MessageDescriptor;
}

// A manager needs to see an unconfigured widget to be able to fix it. Everyone
// else, previews included, should see what the published page shows: nothing.
const EmptyState = ({ title, explanation }: Props) => {
  const isInBuilderCanvas = useIsInBuilderCanvas();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  if (!isInBuilderCanvas) return null;

  return (
    <Box
      px={isSmallerThanPhone ? undefined : DEFAULT_PADDING}
      py={DEFAULT_PADDING}
      w="100%"
      display="flex"
      justifyContent="center"
    >
      <Box w="100%" maxWidth="1200px">
        <Title
          variant="h3"
          mt="0px"
          ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        >
          {title}
        </Title>
        <Warning>{formatMessage(explanation)}</Warning>
      </Box>
    </Box>
  );
};

export default EmptyState;
