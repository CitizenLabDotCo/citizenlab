import React from 'react';

import { Box, colors, Icon, Tooltip } from '@citizenlab/cl2-component-library';
import Badge from 'component-library/components/Badge';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const EarlyAccessBadge = () => {
  const { formatMessage } = useIntl();
  return (
    <Box display="flex">
      <Badge
        color={colors.primary}
        style={{
          border: 'none',
          padding: '0px',
        }}
      >
        <Box mt="0px" display="flex" alignItems="center">
          {formatMessage(messages.earlyAccessLabel)}
          <Tooltip
            content={
              <Box w="240px" style={{ textTransform: 'none' }}>
                {formatMessage(messages.earlyAccessLabelExplanation)}
              </Box>
            }
          >
            <Icon
              ml="4px"
              width="16px"
              name="info-outline"
              fill={colors.primary}
            />
          </Tooltip>
        </Box>
      </Badge>
    </Box>
  );
};

export default EarlyAccessBadge;
