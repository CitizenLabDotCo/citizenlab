import React, { memo } from 'react';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// styling
import styled from 'styled-components';
import messages from '../messages';
import DateBlockSingleYear from './DateBlockSingleYear';
// components
import { EventDateBlockWrapper, EventDateBlockLabel } from './styling';

const FirstDateBlockWrapper = styled.div`
  margin-bottom: 17px;
`;

interface Props {
  startAtDay: string;
  endAtDay: string;
  startAtMonth: string;
  endAtMonth: string;
  startAtYear: string;
  endAtYear: string;
}

export default memo<Props>((props) => {
  const {
    startAtDay,
    endAtDay,
    startAtMonth,
    endAtMonth,
    startAtYear,
    endAtYear,
  } = props;

  return (
    <EventDateBlockWrapper>
      <FirstDateBlockWrapper>
        <EventDateBlockLabel>
          <FormattedMessage {...messages.startsAt} />
        </EventDateBlockLabel>

        <DateBlockSingleYear
          startAtDay={startAtDay}
          startAtMonth={startAtMonth}
          startAtYear={startAtYear}
        />
      </FirstDateBlockWrapper>

      <EventDateBlockLabel>
        <FormattedMessage {...messages.endsAt} />
      </EventDateBlockLabel>

      <DateBlockSingleYear
        startAtDay={endAtDay}
        startAtMonth={endAtMonth}
        startAtYear={endAtYear}
      />
    </EventDateBlockWrapper>
  );
});
