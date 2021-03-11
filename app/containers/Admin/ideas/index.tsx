import React, { memo, useState } from 'react';

// module
import { InsertTabOptions, ITab } from 'typings';
import { insertTab } from 'utils/moduleUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import Outlet from 'components/Outlet';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

export interface Props {
  children: JSX.Element;
}

const IdeasPage = memo(
  ({ intl: { formatMessage }, children }: Props & InjectedIntlProps) => {
    const [tabs, setTabs] = useState<ITab[]>([
      {
        label: formatMessage(messages.tabManage),
        name: 'manage',
        url: '/admin/ideas',
      },
    ]);

    const resource = {
      title: formatMessage(messages.inputManagerPageTitle),
      subtitle: formatMessage(messages.inputManagerPageSubtitle),
    };

    const handleData = (insertTabOptions: InsertTabOptions) =>
      setTabs(insertTab(insertTabOptions));

    return (
      <>
        <Outlet id="app.containers.Admin.ideas.tabs" onData={handleData} />
        <TabbedResource resource={resource} tabs={tabs}>
          <HelmetIntl
            title={messages.inputManagerMetaTitle}
            description={messages.inputManagerMetaDescription}
          />
          {children}
        </TabbedResource>
      </>
    );
  }
);

export default injectIntl(IdeasPage);
