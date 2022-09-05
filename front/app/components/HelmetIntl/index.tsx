import React from 'react';
import { Helmet } from 'react-helmet';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {
  title: ReactIntl.FormattedMessage.MessageDescriptor;
  description: ReactIntl.FormattedMessage.MessageDescriptor;
};

interface State {}

export class HelmetIntl extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  render() {
    const { formatMessage } = this.props.intl;
    const { title, description } = this.props;

    return (
      <>
        <Helmet
          title={formatMessage(title)}
          meta={[{ name: 'description', content: formatMessage(description) }]}
        />
      </>
    );
  }
}

export default injectIntl<Props>(HelmetIntl);
