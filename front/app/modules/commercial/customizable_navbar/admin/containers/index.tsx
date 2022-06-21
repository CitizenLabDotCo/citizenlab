import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';

export const NAVIGATION_PATH = '/admin/pages-menu';

const Containers = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  if (!featureEnabled) return null;

  return (
    <TabbedResource
      resource={{
        title: formatMessage(messages.pageHeader),
        subtitle: formatMessage(messages.pageSubtitle),
      }}
    >
      <RouterOutlet />
    </TabbedResource>
  );
};

export default injectIntl(Containers);
