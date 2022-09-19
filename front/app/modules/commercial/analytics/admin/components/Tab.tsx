import { useEffect } from 'react';

// i18n
import messages from './messages';

// typings
import { ITabsOutlet } from 'utils/moduleUtils';

const Tab = ({ onData, formatMessage }: ITabsOutlet) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.tabVisitors),
          name: 'visitors',
          url: '/admin/dashboard/visitors',
          feature: 'analytics',
        },
        insertAfterName: 'users',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return null;
};

export default Tab;
