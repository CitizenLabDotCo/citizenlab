import React, { MouseEvent } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  onOpen: () => void;
}

const RowTitleButton = ({ title, onOpen }: Props) => {
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <Box
      as="button"
      type="button"
      display="block"
      minWidth="0"
      maxWidth="100%"
      p="0"
      background="transparent"
      border="none"
      cursor="pointer"
      onClick={handleClick}
    >
      <Text
        variant="boLabel"
        color="textPrimary"
        as="span"
        display="block"
        m="0"
        textAlign="left"
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      >
        {title}
      </Text>
    </Box>
  );
};

export default RowTitleButton;
