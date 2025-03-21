import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  count: number;
};

const CommentSummary = ({ count }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" gap="4px">
      <Box my="auto">
        <Icon width="16px" name="comment" fill={colors.coolGrey500} />
      </Box>
      <Text my="auto" color="coolGrey700" style={{ flexShrink: 0 }}>
        {formatMessage(messages.xComments, { count })}
      </Text>
    </Box>
  );
};

export default CommentSummary;
