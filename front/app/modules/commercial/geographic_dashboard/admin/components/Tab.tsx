import { FC, useEffect } from 'react';
import messages from './messages';
import { ITabsOutlet } from 'utils/moduleUtils';

const Tab: FC<ITabsOutlet> = ({ onData, formatMessage }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.tabMap),
          name: 'geographic_dashboard',
          url: '/admin/dashboard/map',
          feature: 'geographic_dashboard',
        },
        insertAfterName: 'users',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default Tab;
