import React from 'react';
import PageMeta from 'components/PageMeta';
import messages from './messages';

export default () => (
  <PageMeta
    titleMessage={messages.eventsPageTitle}
    descriptionMessage={messages.eventsPageDescription}
  />
);
