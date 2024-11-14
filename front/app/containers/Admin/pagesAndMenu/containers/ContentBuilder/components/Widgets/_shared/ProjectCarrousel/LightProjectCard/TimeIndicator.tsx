import React from 'react';

import {
  Box,
  Color,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import PhaseTimeLeft from 'components/PhaseTimeLeft';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  currentPhaseEndsAt?: string | null;
  projectStartsInDays: number | null;
  projectEndedDaysAgo: number | null;
}

const TimeIndicator = ({
  currentPhaseEndsAt,
  projectStartsInDays,
  projectEndedDaysAgo,
}: Props) => {
  const { formatMessage } = useIntl();

  if (currentPhaseEndsAt) {
    return (
      <Wrapper icon="clock-circle" color="textPrimary">
        <PhaseTimeLeft currentPhaseEndsAt={currentPhaseEndsAt} />
      </Wrapper>
    );
  }

  if (projectStartsInDays) {
    return <></>; // TODO
  }

  if (projectEndedDaysAgo) {
    return <></>; // TODO
  }

  return (
    <Wrapper icon="clock-circle" color="textPrimary">
      {formatMessage(messages.noEndDate)}
    </Wrapper>
  );
};

interface WrapperProps {
  icon: IconNames;
  color: Color;
  children: React.ReactNode;
}

const Wrapper = ({ icon, color, children }: WrapperProps) => {
  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <Icon name={icon} fill={colors[color]} height="16px" mr="4px" ml="-4px" />
      <Text color={color} display="inline" m="0">
        {children}
      </Text>
    </Box>
  );
};

export default TimeIndicator;
