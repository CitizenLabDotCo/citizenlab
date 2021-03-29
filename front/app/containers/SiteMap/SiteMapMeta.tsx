import React from 'react';
import { Helmet } from 'react-helmet';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const SiteMapMeta = ({ intl }) => (
  <Helmet>
    <title>{intl.formatMessage(messages.siteMapTitle)}</title>
    <meta
      name="description"
      content={intl.formatMessage(messages.siteMapDescription)}
    />
  </Helmet>
);

export default injectIntl(SiteMapMeta);
