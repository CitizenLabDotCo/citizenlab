import * as React from 'react';
import { Helmet } from 'react-helmet';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Message } from 'typings.d';

type Props = {
  title: Message;
  description: Message;
};

type State = {};

export class HelmetIntl extends React.PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { formatMessage } = this.props.intl;
    const { title, description } = this.props;

    return (
      <div>
        <Helmet
          title={formatMessage(title)}
          meta={[
            { name: 'description', content: formatMessage(description) },
          ]}
        />
      </div>
    );
  }
}

export default injectIntl<Props>(HelmetIntl);
