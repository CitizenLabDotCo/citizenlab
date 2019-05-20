import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export type IGraphUnit = 'users' | 'ideas' | 'comments';

export type IResolution = 'day' | 'week' | 'month';

interface Props {
}

export class InitiativesPage extends React.PureComponent<Props & InjectedIntlProps> {
  private tabs = [
    { label: this.props.intl.formatMessage(messages.tabSettings), url: '/admin/initiatives' },
    // TODO  { label: this.props.intl.formatMessage(messages.tabManage), url: '/admin/initiatives/manage' },
  ];
  private resource = {
    title: this.props.intl.formatMessage(messages.titleInitiatives),
    subtitle: this.props.intl.formatMessage(messages.subtitleInitiatives)
  };

  render() {
    const { children } = this.props;
    return (
      <TabbedResource
        resource={this.resource}
        tabs={this.tabs}
      >
        <HelmetIntl
          title={messages.metaTitle}
          description={messages.metaDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

export default injectIntl(InitiativesPage);
