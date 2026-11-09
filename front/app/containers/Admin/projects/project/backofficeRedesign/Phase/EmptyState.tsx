import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

const SIZES = {
  large: {
    iconSize: '120px',
    padding: '40px 24px',
    textWidth: '360px',
  },
  small: {
    iconSize: '72px',
    padding: '24px 20px',
    textWidth: '240px',
  },
};

interface Props {
  title?: string;
  description: string;
  size: 'large' | 'small';
}

const EmptyState = ({ title, description, size }: Props) => {
  const { iconSize, padding, textWidth } = SIZES[size];

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="8px"
      p={padding}
    >
      <Icon
        name="book"
        width={iconSize}
        height={iconSize}
        fill={colors.grey400}
        mb="12px"
      />
      {title && (
        <Text
          m="0"
          fontSize="s"
          fontWeight="semi-bold"
          lineHeight="20px"
          color="textPrimary"
          textAlign="center"
        >
          {title}
        </Text>
      )}
      <Text
        m="0"
        maxWidth={textWidth}
        fontSize="s"
        lineHeight="20px"
        color="textSecondary"
        textAlign="center"
      >
        {description}
      </Text>
    </Box>
  );
};

export default EmptyState;
