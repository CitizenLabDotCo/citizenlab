import React from 'react';
import moment from 'moment';

// components
import { Text } from '@citizenlab/cl2-component-library';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// typings
import useLocale from 'hooks/useLocale';
import { IEventData } from 'api/events/types';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { capitalizeDates, getDayName } from 'utils/dateUtils';
import { useIntl } from 'utils/cl-intl';

export interface Props {
  event: IEventData;
}

const FullEventTime = ({ event }: Props) => {
  const currentLocale = useLocale();
  const { formatMessage } = useIntl();
  const startAtMoment = moment(event.attributes.start_at);
  const endAtMoment = moment(event.attributes.end_at);
  const isEventMultipleDays =
    startAtMoment.dayOfYear() !== endAtMoment.dayOfYear();
  const startAtWeekday = getDayName(startAtMoment.weekday());
  const endAtWeekday = getDayName(endAtMoment.weekday());

  const eventDateTime = isEventMultipleDays
    ? `${
        startAtWeekday && formatMessage(startAtWeekday)
      }, ${startAtMoment.format('LLL')} - ${
        endAtWeekday && formatMessage(endAtWeekday)
      }, ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  if (location && !isNilOrError(currentLocale)) {
    return (
      <Container>
        <StyledIcon name="calendar" ariaHidden />
        <Content>
          <Text mt="12px" color="coolGrey600" fontSize="s">
            {capitalizeDates(currentLocale)
              ? eventDateTime
              : eventDateTime.toLowerCase()}
          </Text>
        </Content>
      </Container>
    );
  }

  return null;
};

export default FullEventTime;
