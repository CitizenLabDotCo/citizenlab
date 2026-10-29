import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import { StatCard } from '../StatCardLink';

const EmptyCard = () => {
  const { formatMessage, formatNumber } = useIntl();

  return (
    <StatCard
      role="group"
      aria-label={formatMessage(messages.participantsGraphLabel)}
    >
      <Text variant="boMicro" m="0">
        {formatMessage(messages.participantsGraphLabel)}
      </Text>
      <Text m="0" mt="2px" fontSize="xxl" fontWeight="bold" color="coolGrey500">
        {formatNumber(0)}
      </Text>
      <Box mt="40px" borderTop={`1px dashed ${colors.coolGrey300}`} />
      <Text variant="boMicro" mt="8px" mb="0">
        {formatMessage(messages.participantsEmpty)}
      </Text>
    </StatCard>
  );
};

export default EmptyCard;
