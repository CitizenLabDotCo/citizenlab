import { FC, useEffect } from 'react';
import messages from './messages';
import { ITabsOutlet } from 'utils/moduleUtils';

const Tab: FC<ITabsOutlet> = ({ onData, formatMessage }) => {
  useEffect(
    () =>
      onData({
        tabConfiguration: {
          label: formatMessage(messages.tabMap),
          name: 'geographic_dashboard',
          url: '/admin/dashboard/map',
          feature: 'geographic_dashboard',
        },
        insertAfterTabName: 'users',
      }),
    []
  );
  return null;
};

export default Tab;
