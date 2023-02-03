import React from 'react';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {
  title: MessageDescriptor;
  description?: MessageDescriptor;
} & WrappedComponentProps;

const HelmetIntl = ({ title, description, intl: { formatMessage } }: Props) => {
  return (
    <>
      <Helmet
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

export default injectIntl(HelmetIntl);
