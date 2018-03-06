import * as React from 'react';

// router
import { withRouter, RouterState } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {};

type State = {};

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps & RouterState, State> {
  constructor(props: Props) {
    super(props as any);
  }

  render() {
    const { location, children } = this.props;
    const { formatMessage } = this.props.intl;

    const tabs = [
      { label: formatMessage(messages.tabSettings), url: '/admin/settings/general' },
      { label: formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
      { label: formatMessage(messages.tabPages), url: '/admin/settings/pages' },
      { label: formatMessage(messages.tabRegistration), url: '/admin/settings/registration' },
    ];

    const resource = {
      title: formatMessage(messages.viewPublicResource)
    };

    return (
      <>
        <TabbedResource
          resource={resource}
          messages={messages}
          tabs={tabs}
          location={location}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          {children}
        </TabbedResource>
      </>
    );
  }
}

export default withRouter(injectIntl<Props>(SettingsPage) as any);
