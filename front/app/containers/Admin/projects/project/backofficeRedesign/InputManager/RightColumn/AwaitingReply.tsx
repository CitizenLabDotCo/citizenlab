import React from 'react';

import {
  bo,
  Box,
  Button,
  colors,
  Icon,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  count: number;
  onShow: () => void;
}

const AwaitingReply = ({ count, onShow }: Props) => {
  const { formatMessage } = useIntl();

  if (count === 0) return null;

  return (
    <Box
      display="flex"
      gap="10px"
      p="12px 16px"
      background={colors.orange100}
      borderRadius={bo.borderRadius}
    >
      <Icon name="clock" width="18px" fill={colors.orange500} />
      <Box>
        <Text variant="boSection" color="orange500" m="0">
          {formatMessage(messages.awaitingReply, { count })}
        </Text>
        <Button
          buttonStyle="text"
          padding="0"
          fontSize="14px"
          textDecoration="underline"
          textColor={colors.orange500}
          onClick={onShow}
        >
          {formatMessage(messages.showAwaitingReply)}
        </Button>
      </Box>
    </Box>
  );
};

export default AwaitingReply;
