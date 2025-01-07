import React from 'react';

import { Helmet } from 'react-helmet-async';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SiteMapMeta = () => {
  const { formatMessage } = useIntl();
  return (
    <Helmet>
      <title>{formatMessage(messages.headSiteMapTitle)}</title>
      <meta name="title" content={formatMessage(messages.headSiteMapTitle)} />
      <meta
        property="og:title"
        content={formatMessage(messages.headSiteMapTitle)}
      />
      <meta
        name="description"
        content={formatMessage(messages.siteMapDescription)}
      />
      <meta
        property="og:description"
        content={formatMessage(messages.siteMapDescription)}
      />
    </Helmet>
  );
};

export default SiteMapMeta;
