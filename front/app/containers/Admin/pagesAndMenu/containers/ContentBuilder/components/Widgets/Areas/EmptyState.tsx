import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAreaTerms from 'hooks/areaTerms/useAreaTerms';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const EmptyState = () => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const { areasTerm } = useAreaTerms();

  const { formatMessage } = useIntl();

  return (
    <Box
      px={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
      data-cy="e2e-areas-widget-empty-state"
    >
      <Text color="textSecondary">
        {formatMessage(messages.thereAreCurrentlyNoProjects, {
          areasTerm,
        })}
      </Text>
    </Box>
  );
};

export default EmptyState;
