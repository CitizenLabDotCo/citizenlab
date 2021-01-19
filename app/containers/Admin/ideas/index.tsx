import React, { memo } from 'react';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

export interface Props {
  children: JSX.Element;
}

const IdeasPage = memo(
  ({
    intl: { formatMessage },
    location,
    children,
  }: Props & InjectedIntlProps & WithRouterProps) => {
    const ideaStatusCustomisationEnabled = useFeatureFlag(
      'custom_idea_statuses'
    );
    const resource = {
      title: formatMessage(messages.inputManagerPageTitle),
      subtitle: formatMessage(messages.inputManagerPageSubtitle),
    };

    const getTabs = () => {
      const tabs: TabProps[] = [
        {
          label: formatMessage(messages.tabManage),
          url: '/admin/ideas',
        },
      ];

      if (ideaStatusCustomisationEnabled) {
        tabs.push({
          label: formatMessage(messages.tabStatuses),
          url: '/admin/ideas/statuses',
          active: location.pathname.includes('/admin/ideas/statuses'),
        });
      }

      return tabs;
    };

    return (
      <TabbedResource resource={resource} tabs={getTabs()}>
        <HelmetIntl
          title={messages.inputManagerMetaTitle}
          description={messages.inputManagerMetaDescription}
        />
        {children}
      </TabbedResource>
    );
  }
);

export default withRouter(injectIntl(IdeasPage));
