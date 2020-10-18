import React from 'react';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface InputProps {}

interface DataProps {
  location;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeasPage extends React.PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  getTabs = () => {
    const { formatMessage } = this.props.intl;

    let tabs: TabProps[] = [
      {
        label: formatMessage(messages.tabSettings),
        url: '/admin/ideas',
      },
      {
        label: formatMessage(messages.tabCustomize),
        url: '/admin/ideas/statuses',
        active: this.props.location.pathname.includes('/admin/ideas/statuses'),
      },
    ];
    return tabs;
  };

  render() {
    const { children } = this.props;
    const { formatMessage } = this.props.intl;

    const resource = {
      title: formatMessage(messages.pageTitle),
    };

    return (
      <TabbedResource resource={resource} tabs={this.getTabs()}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

const IdeasPageWithHocs = withRouter(injectIntl(IdeasPage));

export default (inputProps: InputProps & WithRouterProps) => (
  <IdeasPageWithHocs {...inputProps} />
);
