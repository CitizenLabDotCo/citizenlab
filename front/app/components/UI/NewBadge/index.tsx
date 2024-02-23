import React from 'react';

// components
import { Box, fontSizes, colors } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { lighten } from 'polished';

const NewBadge = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="inline"
      style={{
        fontSize: `${fontSizes.xs}px`,
        fontWeight: 700,
        color: colors.teal400,
      }}
      bgColor={lighten(0.08)(colors.teal100)}
      p="1px 4px"
      borderRadius="4px"
    >
      {formatMessage(messages.newBadge)}
    </Box>
  );
};

export default NewBadge;
