import React from 'react';
import moment from 'moment';

// components
import {
  Icon,
  Button,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import DateBlocks from '../DateBlocks';

// types
import { IEventData } from 'api/events/types';

// i18n
import T from 'components/T';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled, { useTheme } from 'styled-components';
import { colors } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';
import EventAttendanceButton from 'components/EventAttendanceButton';

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
  const theme = useTheme();

  // const isPastEvent = moment().isAfter(endAtMoment); // TODO: Re-enable once event attendance smart group added
  const address1 = event?.attributes?.address_1;
  const onlineLink = event?.attributes?.online_link;
  const tempShowEventAttendance = false; // TODO: Replace once event attendance smart group added

  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  return (
    <EventInformationContainer data-testid="EventInformation">
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
        >
          <Title
            variant="h4"
            style={{ fontSize: titleFontSize, fontWeight: '600' }}
            pr="8px"
            color="tenantText"
          >
            <T value={event.attributes.title_multiloc} />
          </Title>
          <DateBlocks
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            isMultiDayEvent={false}
            showOnlyStartDate={true}
          />
        </Box>
      </Box>
      <Box height="100%">
        <Box my="16px" pt="12px" pb="4px" background={colors.grey100} px="16px">
          <Box
            display="flex"
            mb="12px"
            flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
          >
            <Box flexShrink={0} my="auto">
              <Icon
                my="auto"
                fill={colors.coolGrey300}
                name="clock"
                ariaHidden
                mr={theme.isRtl ? '0px' : '8px'}
                ml={theme.isRtl ? '8px' : '0px'}
              />
            </Box>
            <Text m="0px" pt="2px" color={'coolGrey700'} fontSize="s">
              {eventDateTime}
            </Text>
          </Box>
          {address1 && (
            <Box
              display="flex"
              mb="12px"
              flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
            >
              <Box flexShrink={0} my="auto">
                <Icon
                  my="auto"
                  fill={colors.coolGrey300}
                  name="position"
                  ariaHidden
                  mr={theme.isRtl ? '0px' : '8px'}
                  ml={theme.isRtl ? '8px' : '0px'}
                />
              </Box>
              <Text m="0px" pt="2px" color={'coolGrey700'} fontSize="s">
                {address1?.includes(',')
                  ? address1?.slice(0, address1.indexOf(','))
                  : address1}
              </Text>
            </Box>
          )}
          {onlineLink && (
            <Box display="flex" mb="12px">
              <Icon
                my="auto"
                fill={colors.coolGrey300}
                name="link"
                ariaHidden
                mr="8px"
              />
              <Text
                m="0px"
                color="coolGrey700"
                fontSize="s"
                role="button"
                pt="2px"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(onlineLink, '_blank');
                }}
                style={{ textDecoration: 'underline' }}
              >
                {formatMessage(messages.online)}
              </Text>
            </Box>
          )}
          {tempShowEventAttendance &&
            event.attributes.attendees_count > 0 && ( // TODO: Replace once event attendance smart group added
              <Box
                display="flex"
                mb="12px"
                flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
              >
                <Box flexShrink={0} my="auto">
                  <Icon
                    my="auto"
                    fill={colors.coolGrey300}
                    name="user"
                    ariaHidden
                    mr={theme.isRtl ? '0px' : '8px'}
                    ml={theme.isRtl ? '8px' : '0px'}
                  />
                </Box>
                <Text m="0px" pt="2px" color={'coolGrey700'} fontSize="s">
                  {event.attributes.attendees_count}{' '}
                  {formatMessage(messages.attending)}
                </Text>
              </Box>
            )}
        </Box>
      </Box>
      {!tempShowEventAttendance ? ( // TODO: Replace once event attendance smart group added
        <Button
          ml="auto"
          width={'100%'}
          bgColor={theme.colors.tenantPrimary}
          onClick={() => {
            clHistory.push(`/events/${event.id}`);
          }}
        >
          {formatMessage(messages.readMore)}
        </Button>
      ) : (
        <EventAttendanceButton event={event} />
      )}
    </EventInformationContainer>
  );
};

export default EventInformation;
