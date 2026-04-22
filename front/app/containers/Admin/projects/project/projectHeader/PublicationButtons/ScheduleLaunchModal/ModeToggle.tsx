import React from 'react';

import { Box, Button, Icon, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Mode = 'schedule' | 'now';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const ModeToggle = ({ mode, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" borderRadius="8px" background={colors.grey200} p="4px">
      <Box flex="1">
        <Button
          buttonStyle="text"
          fullWidth
          onClick={() => onChange('schedule')}
          bgColor={mode === 'schedule' ? 'white' : 'transparent'}
          bgHoverColor={mode === 'schedule' ? 'white' : colors.grey300}
          textColor={colors.black}
          borderRadius="6px"
          p="8px"
        >
          <Box display="flex" alignItems="center" gap="8px">
            <Icon name="calendar" fill={colors.black} />
            {formatMessage(messages.schedule)}
          </Box>
        </Button>
      </Box>
      <Box flex="1">
        <Button
          buttonStyle="text"
          fullWidth
          onClick={() => onChange('now')}
          bgColor={mode === 'now' ? 'white' : 'transparent'}
          bgHoverColor={mode === 'now' ? 'white' : colors.grey300}
          textColor={colors.black}
          borderRadius="6px"
          p="8px"
        >
          <Box display="flex" alignItems="center" gap="8px">
            <Icon name="send" fill={colors.black} />
            {formatMessage(messages.now)}
          </Box>
        </Button>
      </Box>
    </Box>
  );
};

export default ModeToggle;
