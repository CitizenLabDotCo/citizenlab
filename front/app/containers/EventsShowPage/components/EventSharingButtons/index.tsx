import React from 'react';

// components
import SharingButtons from 'components/Sharing/SharingButtons';

// i18n
import { useIntl } from 'utils/cl-intl';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'api/me/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { IEventData } from 'api/events/types';
import messages from './messages';

interface Props {
  event: IEventData;
}

const EventSharingButtons = ({ event }: Props) => {
  const { formatMessage } = useIntl();

  const { data: authUser } = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(event)) {
    const eventUrl = `${location.origin}/events/${event.id}`;
    const eventTitle = localize(event.attributes.title_multiloc);
    const eventLocation = localize(event.attributes.location_multiloc);
    const utmParams = authUser
      ? {
          source: 'share_event',
          campaign: 'share_content',
          content: authUser.data.id,
        }
      : {
          source: 'share_event',
          campaign: 'share_content',
        };

    const shareEventMessage = formatMessage(messages.socialSharingMessage, {
      eventTitle,
    });

    return (
      <SharingButtons
        url={eventUrl}
        facebookMessage={shareEventMessage}
        whatsAppMessage={shareEventMessage}
        twitterMessage={shareEventMessage}
        emailSubject={shareEventMessage}
        emailBody={formatMessage(messages.emailSharingBody, {
          eventTitle,
          eventLocation,
        })}
        utmParams={utmParams}
        context={'event'}
      />
    );
  }

  return null;
};

export default EventSharingButtons;
