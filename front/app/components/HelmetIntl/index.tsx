import React from 'react';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {
  title: MessageDescriptor;
  description: MessageDescriptor;
};

interface State {}

export class HelmetIntl extends React.PureComponent<
  Props & WrappedComponentProps,
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
