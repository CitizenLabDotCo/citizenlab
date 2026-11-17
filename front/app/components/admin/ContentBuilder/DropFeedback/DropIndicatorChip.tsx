import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormattedMessage } from 'utils/cl-intl';

const CARET_SIZE = '8px';

type Props = {
  message: MessageDescriptor;
  color: string;
  refused: boolean;
};

const DropIndicatorChip = ({ message, color, refused }: Props) => (
  <Box
    position="absolute"
    left="50%"
    bottom="10px"
    transform="translateX(-50%)"
    display="flex"
    alignItems="center"
    gap="6px"
    px="10px"
    py="4px"
    borderRadius="4px"
    bgColor={color}
    role="status"
  >
    {refused && (
      <Icon name="lock" width="14px" height="14px" fill={colors.white} />
    )}
    <Text
      m="0px"
      fontSize="xs"
      fontWeight="bold"
      color="white"
      whiteSpace="nowrap"
    >
      <FormattedMessage {...message} />
    </Text>
    <Box
      position="absolute"
      bottom="-3px"
      left="50%"
      width={CARET_SIZE}
      height={CARET_SIZE}
      bgColor={color}
      transform="translateX(-50%) rotate(45deg)"
    />
  </Box>
);

export default DropIndicatorChip;
