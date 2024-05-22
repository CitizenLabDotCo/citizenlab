import React from 'react';

import {
  Icon,
  Box,
  Title,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled, { useTheme } from 'styled-components';

import useEventImage from 'api/event_images/useEventImage';
import { IEventData } from 'api/events/types';

import EventAttendanceButton from 'components/EventAttendanceButton';
import T from 'components/T';
import Button from 'components/UI/Button';
import Image from 'components/UI/Image';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getEventDateString } from 'utils/dateUtils';

import DateBlocks from '../DateBlocks';
import messages from '../messages';

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

const PrimaryLink = styled(Link)`
  // For reference https://kittygiraudel.com/2022/04/02/accessible-cards/
  ::before {
    // Use a pseudo-element to expand the hitbox of the link over the whole card.
    content: ''; /* 1 */

    // Expand the hitbox over the whole card.
    position: absolute; /* 2 */
    inset: 0; /* 2 */

    // Place the pseudo-element on top of the whole card.
    z-index: 1; /* 3 */
  }
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
          <PrimaryLink to={`/events/${event.id}`}>
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
          </PrimaryLink>
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
                fill={theme.colors.tenantPrimary}
                name="clock"
                title={formatMessage(messages.eventDateTimeIcon)}
                ariaHidden={false}
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
                  fill={theme.colors.tenantPrimary}
                  name="position"
                  title={formatMessage(messages.locationIconAltText)}
                  ariaHidden={false}
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
            // The zIndex and position relative are needed to make sure
            // the link is clickable by moving it to the top of the card.
            // Without them, the link is not clickable because the primary
            // link is extending the hitbox over the whole card
            <Box display="flex" mb="12px" position="relative" zIndex="2">
              <Icon
                my="auto"
                fill={theme.colors.tenantPrimary}
                name="link"
                title={formatMessage(messages.onlineLinkIconAltText)}
                ariaHidden={false}
                mr="8px"
              />
              <a
                href={onlineLink}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the event from bubbling up to the parent Container
                }}
              >
                <Text
                  m="0px"
                  color="coolGrey700"
                  fontSize="s"
                  pt="2px"
                  style={{ textDecoration: 'underline' }}
                >
                  {formatMessage(messages.online)}
                </Text>
              </a>
            </Box>
          )}
          {event.attributes.attendees_count > 0 && (
            <Box
              display="flex"
              mb="12px"
              flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
            >
              <Box flexShrink={0} my="auto">
                <Icon
                  my="auto"
                  fill={theme.colors.tenantPrimary}
                  name="user"
                  title={formatMessage(messages.attendeesIconAltText)}
                  ariaHidden={false}
                  mr={theme.isRtl ? '0px' : '8px'}
                  ml={theme.isRtl ? '8px' : '0px'}
                />
              </Box>
              <Text m="0px" pt="2px" color={'coolGrey700'} fontSize="s">
                {event.attributes.attendees_count}{' '}
                {formatMessage(
                  isPastEvent ? messages.attended : messages.attending
                )}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      <Box position="relative" zIndex="2">
        {/* The zIndex and position relative are needed to make sure these
          are clickable by moving them to the top of the card. Without them,
          these are not clickable because the primary link is extending
          the hitbox over the whole card */}
        {isPastEvent ? (
          <Button
            ml="auto"
            width={'100%'}
            bgColor={theme.colors.tenantPrimary}
            linkTo={`/events/${event.id}`}
            scrollToTop
          >
            {formatMessage(messages.readMore)}
          </Button>
        ) : (
          <EventAttendanceButton event={event} />
        )}
      </Box>
    </EventInformationContainer>
  );
};

export default EventInformation;
