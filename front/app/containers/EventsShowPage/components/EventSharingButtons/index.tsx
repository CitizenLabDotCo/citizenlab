import React from 'react';

import { BoxFlexProps } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';
import useAuthUser from 'api/me/useAuthUser';

import useLocalize from 'hooks/useLocalize';

import SharingButtons from 'components/Sharing/SharingButtons';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

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
