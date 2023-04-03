import React from 'react';
import { Helmet } from 'react-helmet';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const SiteMapMeta = () => {
  const { formatMessage } = useIntl();
  return (
    <Helmet>
      <title>{formatMessage(messages.siteMapTitle)}</title>
      <meta
        name="description"
        content={formatMessage(messages.siteMapDescription)}
      />
    </Helmet>
  );
};

export default SiteMapMeta;
