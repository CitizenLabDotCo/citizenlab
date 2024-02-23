import React from 'react';

// components
import {
  Box,
  BoxProps,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { lighten } from 'polished';

const NewBadge = (props: BoxProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="inline-block"
      style={{
        fontSize: `${fontSizes.xs}px`,
        fontWeight: 700,
        color: colors.teal400,
        transform: 'translateY(-1px)',
        lineHeight: `${fontSizes.xs}px`,
      }}
      bgColor={lighten(0.08)(colors.teal100)}
      p="4px 6px"
      borderRadius="4px"
      {...props}
    >
      {formatMessage(messages.newBadge)}
    </Box>
  );
};

export default NewBadge;
