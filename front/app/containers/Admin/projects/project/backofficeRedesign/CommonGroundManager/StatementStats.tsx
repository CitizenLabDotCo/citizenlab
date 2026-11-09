import React from 'react';

import { bo, Box, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import StatRow from '../InputManager/SideColumn/StatRow';

import messages from './messages';

interface Props {
  statements: number;
  reactions: number;
  participants: number;
}

const StatementStats = ({ statements, reactions, participants }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box p="8px" borderRadius={bo.panelBorderRadius} background={colors.white}>
      <StatRow label={formatMessage(messages.statements)} value={statements} />
      <StatRow label={formatMessage(messages.reactions)} value={reactions} />
      <StatRow
        label={formatMessage(messages.participants)}
        value={participants}
      />
    </Box>
  );
};

export default StatementStats;
