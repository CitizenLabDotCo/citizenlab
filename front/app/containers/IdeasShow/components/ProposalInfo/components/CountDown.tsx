import React, { useEffect, useState } from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import { convertSecondsToDDHHMM } from 'utils/dateUtils';

import messages from '../messages';

const TimeComponent = styled.div`
  margin: 0 5px 0 0;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border-radius: 5px;
  background-color: ${colors.grey200};
  font-size: ${fontSizes.l}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.tenantText};
`;

const Unit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0 0 0;
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
`;

interface Props {
  targetTime: string;
  className?: string;
}

const CountDown = ({ targetTime, className }: Props) => {
  const [_refresh, setRefresh] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const start = moment();
  const end = moment(targetTime, 'YYYY-MM-DDThh:mm:ss.SSSZ');
  const durationAsSeconds = moment.duration(end.diff(start)).asSeconds();
  const expired = durationAsSeconds <= 0;
  const formattedDuration =
    convertSecondsToDDHHMM(durationAsSeconds).split(':');
  const daysLeft = expired ? '0' : formattedDuration[0];
  const hoursLeft = expired ? '0' : formattedDuration[1];
  const minutesLeft = expired ? '0' : formattedDuration[2];

  return (
    <Box display="flex" className={className}>
      <TimeComponent>
        <Count>{daysLeft}</Count>
        <Unit>
          <FormattedMessage {...messages.days} />
        </Unit>
      </TimeComponent>
      <TimeComponent>
        <Count>{hoursLeft}</Count>
        <Unit>
          <FormattedMessage {...messages.hours} />
        </Unit>
      </TimeComponent>
      <TimeComponent>
        <Count>{minutesLeft}</Count>
        <Unit>
          <FormattedMessage {...messages.minutes} />
        </Unit>
      </TimeComponent>
    </Box>
  );
};

export default CountDown;
