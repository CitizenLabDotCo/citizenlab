import React from 'react';

// components
import SharingButtons from 'components/Sharing/SharingButtons';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'api/me/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { IEventData } from 'api/events/types';
import { BoxFlexProps } from '@citizenlab/cl2-component-library';

interface Props {
  event: IEventData;
  hideTitle?: boolean;
  justifyContent?: BoxFlexProps['justifyContent'];
}

const EventSharingButtons = ({ event, hideTitle, justifyContent }: Props) => {
  const { formatMessage } = useIntl();

  const { data: authUser } = useAuthUser();
  const localize = useLocalize();

  if (!isNilOrError(event)) {
    const eventUrl = `${location.origin}/events/${event.id}`;
    const eventTitle = localize(event.attributes.title_multiloc);
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

    if (eventTitle && eventUrl) {
      return (
        <SharingButtons
          url={eventUrl}
          facebookMessage={shareEventMessage}
          whatsAppMessage={shareEventMessage}
          twitterMessage={shareEventMessage}
          emailSubject={shareEventMessage}
          emailBody={formatMessage(messages.emailSharingBody, {
            eventTitle,
            eventUrl,
          })}
          utmParams={utmParams}
          context={'event'}
          hideTitle={hideTitle}
          justifyContent={justifyContent}
        />
      );
    }
  }

  return null;
};

export default EventSharingButtons;
