import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

type Props = {
  count: number;
  formatMessage: any;
};

const CommentSummary = ({ count, formatMessage }: Props) => (
  <Box display="flex" gap="4px">
    <Box my="auto">
      <Icon width="16px" name="comment" fill={colors.coolGrey500} />
    </Box>
    <Text my="auto" color="coolGrey700" style={{ flexShrink: 0 }}>
      {formatMessage(
        { id: 'xComments', defaultMessage: '{count} comments' },
        { count }
      )}
    </Text>
  </Box>
);

export default CommentSummary;
