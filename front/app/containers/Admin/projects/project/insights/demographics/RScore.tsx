import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface RScoreProps {
  value: number;
}

const RScore: React.FC<RScoreProps> = ({ value }) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" gap="8px" alignItems="center">
      <Text
        fontSize="s"
        fontWeight="bold"
        color="textSecondary"
        m="0px"
        style={{ lineHeight: 0 }}
      >
        {formatMessage(messages.representativeScore)}:
      </Text>
      <Box display="flex" alignItems="center" style={{ lineHeight: 0 }}>
        <Text
          fontSize="s"
          fontWeight="bold"
          color="primary"
          m="0px"
          style={{ fontSize: '14px' }}
        >
          {value}
        </Text>
        <Text
          fontSize="s"
          fontWeight="semi-bold"
          m="0px"
          style={{ fontSize: '14px', color: colors.grey500 }}
        >
          /100
        </Text>
      </Box>
    </Box>
  );
};

export default RScore;
