import React from 'react';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import Summary from './summary';

// resource
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';
import { IProjectModerator } from 'services/users';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

interface Props {
  authUser: GetAuthUserChildProps;
}

class DashboardsPage extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps> {
  render() {
    const { children, authUser } = this.props;
    const { formatMessage } = this.props.intl;
    console.log(authUser);
    console.log(authUser && isAdmin({ data: authUser }));

    const tabs = [
      { label: formatMessage(messages.tabSummary), url: '/admin' },
      { label: formatMessage(messages.tabUsers), url: '/admin/dashboard-users' },
      { label: formatMessage(messages.tabAcquisition), url: '/admin/dashboard-acquisition' }
    ];
    const resource = {
      title: formatMessage(messages.viewPublicResource)
    };
    if (authUser) {
      if (isAdmin({ data: authUser })) {
        return (
          <TabbedResource
            resource={resource}
            messages={messages}
            tabs={tabs}
          >
            <HelmetIntl
              title={messages.helmetTitle}
              description={messages.helmetDescription}
            />
            {children}
          </TabbedResource>
        );
      } else if (isProjectModerator({ data: authUser })) {
        const projectIds = authUser.attributes.roles ?
        authUser.attributes.roles
        .filter(role => role.type === 'project_moderator')
        .map((role: IProjectModerator) => role.project_id) : [];
        return <Summary visibleProjects={projectIds} />;
      }
    }
    return null;
  }
}

const DashboardsPageWithHoC = withRouter(injectIntl(DashboardsPage));

export default (props) => (
  <GetAuthUser {...props}>
    {authUser => <DashboardsPageWithHoC authUser={authUser} {...props} />}
  </GetAuthUser>
);
