import React from 'react';

import { Box, colors, Icon, Tooltip } from '@citizenlab/cl2-component-library';
import Badge from 'component-library/components/Badge';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type EarlyAccessLevel = 'general' | 'internal';

type Props = {
  level?: EarlyAccessLevel;
};

const EarlyAccessBadge = ({ level = 'general' }: Props) => {
  const { formatMessage } = useIntl();
  const internal = level === 'internal';
  const color = internal ? colors.orange500 : colors.primary;

  return (
    <Box display="flex">
      <Badge
        color={color}
        style={{
          border: 'none',
          padding: '0px',
        }}
      >
        <Box mt="0px" display="flex" alignItems="center">
          {formatMessage(
            internal
              ? messages.internalEarlyAccessLabel
              : messages.earlyAccessLabel
          )}
          <Tooltip
            content={
              <Box w="240px" style={{ textTransform: 'none' }}>
                {formatMessage(
                  internal
                    ? messages.internalEarlyAccessLabelExplanation
                    : messages.earlyAccessLabelExplanation
                )}
              </Box>
            }
          >
            <Icon ml="4px" width="16px" name="info-outline" fill={color} />
          </Tooltip>
        </Box>
      </Badge>
    </Box>
  );
};

// ts-prune-ignore-next
export default EarlyAccessBadge;
