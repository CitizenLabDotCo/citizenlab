import React from 'react';
import moment from 'moment';

// components
import {
  Icon,
  Button,
  Box,
  Title,
  useBreakpoint,
  Text,
} from '@citizenlab/cl2-component-library';

// services
import { IEventData } from 'api/events/types';

// i18n
import T from 'components/T';
import { useIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// other
import DateBlocks from '../DateBlocks';
import messages from '../messages';
import useEventAttendances from 'api/event_attendance/useEventAttendances';
import useAddEventAttendance from 'api/event_attendance/useAddEventAttendance';
import useAuthUser from 'api/me/useAuthUser';

const EventInformationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

interface Props {
  event: IEventData;
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showAttachments?: boolean;
  titleFontSize?: number;
}

const EventInformation = ({
  event,
  isMultiDayEvent,
  startAtMoment,
  endAtMoment,
  titleFontSize,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: eventAttendances } = useEventAttendances(event.id);
  const { mutate: addEventAttendance } = useAddEventAttendance();
  const { data: user } = useAuthUser();

  const isMobile = useBreakpoint('phone');
  const locationDescription = event?.attributes?.location_description;

  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const registerAttendance = () => {
    console.log('Register attendance functiony');
    if (user) {
      addEventAttendance({ eventId: event.id, attendeeId: user.data?.id });
    }
  };

  console.log(eventAttendances?.data);

  return (
    <EventInformationContainer data-testid="EventInformation">
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Title
            variant="h4"
            style={{ fontSize: titleFontSize, fontWeight: '600' }}
          >
            <T value={event.attributes.title_multiloc} />
          </Title>
          <DateBlocks
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            isMultiDayEvent={false}
          />
        </Box>
      </Box>
      <Box
        mt="16px"
        marginBottom="16px"
        pt="12px"
        background={colors.grey100}
        px="16px"
      >
        <Box display="flex" mb="12px">
          <Icon
            my="auto"
            fill={colors.coolGrey300}
            name="clock"
            ariaHidden
            mr="8px"
          />
          <Text m="0px" color={'coolGrey700'} fontSize="s">
            {eventDateTime}
          </Text>
        </Box>{' '}
        {locationDescription && (
          <Box display="flex" mb="12px">
            <Icon
              my="auto"
              fill={colors.coolGrey300}
              name="position"
              ariaHidden
              mr="8px"
            />
            <Text m="0px" color={'coolGrey700'} fontSize="s">
              {locationDescription?.slice(0, locationDescription.indexOf(','))}
            </Text>
          </Box>
        )}
      </Box>
      <Button
        ml="auto"
        width={isMobile ? '100%' : '320px'}
        iconPos="right"
        icon="plus"
        onClick={(event) => {
          event.preventDefault();
          registerAttendance();
        }}
      >
        {formatMessage(messages.attend)}
      </Button>
    </EventInformationContainer>
  );
};

export default EventInformation;
