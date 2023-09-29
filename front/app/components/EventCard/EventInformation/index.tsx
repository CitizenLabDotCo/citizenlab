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
import Image from 'components/UI/Image';

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
import { getEventDateString } from 'utils/dateUtils';

// hooks
import useEventImage from 'api/event_images/useEventImage';

const EventInformationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EventCardImage = styled(Image)`
  width: 100%;
  height: 100%;
  flex: 1;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
`;

interface Props {
  event: IEventData;
  titleFontSize?: number;
}

const EventInformation = ({ event, titleFontSize }: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  // event image
  const { data: eventImage } = useEventImage(event);
  const mediumImage = eventImage?.data?.attributes?.versions?.medium;

  const startAtMoment = moment(event.attributes.start_at);
  const endAtMoment = moment(event.attributes.end_at);

  const isPastEvent = moment().isAfter(endAtMoment);
  const address1 = event?.attributes?.address_1;
  const onlineLink = event?.attributes?.online_link;
  const eventDateTime = getEventDateString(event);
  return (
    <EventInformationContainer data-testid="EventInformation">
      <Box id="e2e-event-card">
        {mediumImage && (
          <Box height="140px" m="-16px">
            <EventCardImage src={mediumImage} cover={true} alt="" />
          </Box>
        )}
        <Box
          display="flex"
          justifyContent="space-between"
          flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
          mt={eventImage ? '32px' : 'auto'}
        >
          <Title
            variant="h4"
            as="h2"
            style={{ fontSize: titleFontSize, fontWeight: '600' }}
            pr="8px"
            color="tenantText"
            m="0px"
            mt="auto"
            mb="auto"
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
          {!isPastEvent && event.attributes.attendees_count > 0 && (
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
      {isPastEvent ? (
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
