import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import EventSharingButtons from 'containers/EventsShowPage/components/EventSharingButtons';

import { AddEventToCalendarButton } from 'components/AddEventToCalendarButton';
import Modal from 'components/UI/Modal';

import { EventModalConfetti } from './EventModalConfetti';
import messages from './messages';

import useAuthUser from 'api/me/useAuthUser';
import { useIntl } from 'utils/cl-intl';
import { IEventData } from 'api/events/types';
import useLocalize from 'hooks/useLocalize';
import { getEventDateString } from 'utils/dateUtils';

interface Props {
  opened: boolean;
  event: IEventData;
  onClose: () => void;
}

const ConfirmationModal = ({ opened, event, onClose }: Props) => {
  const { data: user } = useAuthUser();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const eventDateTime = getEventDateString(event);

  return (
    <Modal
      opened={opened}
      close={onClose}
      header={
        <Title mt="4px" mb="0px" variant="h3">
          {user?.data?.attributes?.first_name
            ? formatMessage(messages.seeYouThereName, {
                userFirstName: user?.data?.attributes?.first_name,
              })
            : formatMessage(messages.seeYouThere)}
        </Title>
      }
      width={'520px'}
    >
      <EventModalConfetti />
      <Box pt="0px" p="36px">
        <Title my="12px" variant="h3" style={{ fontWeight: 600 }}>
          {localize(event?.attributes?.title_multiloc)}
        </Title>
        <Text my="4px" color="coolGrey600" fontSize="m">
          {eventDateTime}
        </Text>
        <AddEventToCalendarButton eventId={event.id} />
        {event && (
          <Box mt="16px" width="100%" mx="auto">
            <Text
              textAlign="center"
              width="100%"
              mb="8px"
              style={{ fontWeight: 600 }}
            >
              {formatMessage(messages.forwardToFriend)}
            </Text>
            <EventSharingButtons
              event={event}
              hideTitle={true}
              justifyContent="center"
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
