import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';
import navbarMessages from 'modules/commercial/customizable_navbar/admin/containers/messages';

export const NAVIGATION_PATH = '/admin/pages-menu';

const Containers = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });
  const [title, subtitle] = featureEnabled
    ? [
        formatMessage(navbarMessages.pageHeader),
        formatMessage(navbarMessages.pageSubtitle),
      ]
    : [formatMessage(messages.pageHeader), undefined];

  return (
    <TabbedResource
      resource={{
        title,
        subtitle,
      }}
    >
      <RouterOutlet />
    </TabbedResource>
  );
};

export default injectIntl(Containers);
