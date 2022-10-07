import React from 'react';
import { Helmet } from 'react-helmet';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

interface Props {
  title: ReactIntl.FormattedMessage.MessageDescriptor;
  // E.g. admin pages don't require a description
  // because they're not indexed for SEO.
  description?: ReactIntl.FormattedMessage.MessageDescriptor;
}

const HelmetIntl = ({
  title,
  description,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  return (
    <Helmet
      title={formatMessage(title)}
      meta={[
        {
          name: 'description',
          content: description ? formatMessage(description) : '',
        },
      ]}
    />
  );
};

export default injectIntl(HelmetIntl);
