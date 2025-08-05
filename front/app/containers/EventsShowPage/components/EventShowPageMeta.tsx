import React from 'react';

import { Helmet } from 'react-helmet-async';

import useEventImage from 'api/event_images/useEventImage';
import { IEventData } from 'api/events/types';
import useAuthUser from 'api/me/useAuthUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import getAlternateLinks from 'utils/cl-router/getAlternateLinks';
import getCanonicalLink from 'utils/cl-router/getCanonicalLink';
import { imageSizes } from 'utils/fileUtils';
import { stripHtml } from 'utils/textUtils';

import messages from '../messages';

interface Props {
  event: IEventData;
}

const EventShowPageMeta = ({ event }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const tenantLocales = useAppConfigurationLocales();
  const { data: authUser } = useAuthUser();
  const { data: eventImage } = useEventImage(event);

  if (!tenantLocales) return null;

  const metaTitle = formatMessage(messages.metaTitle, {
    eventTitle: localize(event.attributes.title_multiloc, {
      maxChar: 50,
    }),
  });
  const description = stripHtml(
    localize(event.attributes.description_multiloc),
    250
  );
  const image = eventImage?.data.attributes.versions.large;
  const { location } = window;

  return (
    <Helmet>
      <title>
        {`${
          authUser &&
          typeof authUser.data.attributes.unread_notifications === 'number' &&
          authUser.data.attributes.unread_notifications > 0
            ? `(${authUser.data.attributes.unread_notifications}) `
            : ''
        }
            ${metaTitle}`}
      </title>
      {getCanonicalLink()}
      {getAlternateLinks(tenantLocales)}
      <meta name="title" content={metaTitle} />
      <meta name="description" content={description} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta
        property="og:image:width"
        content={`${imageSizes.projectBg.large[0]}`}
      />
      <meta
        property="og:image:height"
        content={`${imageSizes.projectBg.large[1]}`}
      />
      <meta property="og:url" content={location.href} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

export default EventShowPageMeta;
