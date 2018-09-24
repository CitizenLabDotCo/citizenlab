import * as React from 'react';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {};

type State = {};

class EmailsDashboard extends React.PureComponent<Props & InjectedIntlProps, State> {

  tabs = () => ([
    { label: this.props.intl.formatMessage(messages.tabManual), url: '/admin/emails/manual' },
    { label: this.props.intl.formatMessage(messages.tabAutomated), url: '/admin/emails/automated' },
  ])

  render() {
    const { children, intl: { formatMessage } } = this.props;

    return (
      <TabbedResource
        resource={{ title: formatMessage(messages.titleEmails) }}
        messages={messages}
        tabs={this.tabs()}
      >
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

export default injectIntl(EmailsDashboard);
