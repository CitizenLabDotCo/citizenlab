import React from 'react';

import { Helmet } from 'react-helmet-async';
import { MessageDescriptor } from 'react-intl';

import { useIntl } from 'utils/cl-intl';

type Props = {
  title: MessageDescriptor;
  description?: MessageDescriptor;
};

const HelmetIntl = ({ title, description }: Props) => {
  const { formatMessage, locale } = useIntl();

  return (
    <>
      <Helmet
        htmlAttributes={{ lang: locale || 'en' }}
        title={formatMessage(title)}
        meta={
          description
            ? [{ name: 'description', content: formatMessage(description) }]
            : undefined
        }
      />
    </>
  );
};

export default HelmetIntl;
