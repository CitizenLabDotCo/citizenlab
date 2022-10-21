import PageMeta from 'components/PageMeta';
import React from 'react';
import messages from './messages';

export default () => (
  <PageMeta
    titleMessage={messages.eventsPageTitle}
    descriptionMessage={messages.eventsPageDescription}
  />
);
