import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const RepresentativenessArticleLink = () => (
  <a
    href="https://en.wikipedia.org/wiki/Chi-squared_test"
    target="_blank"
    rel="noreferrer"
  >
    <FormattedMessage {...messages.representativenessArticleLinkText} />
  </a>
);

export default RepresentativenessArticleLink;
