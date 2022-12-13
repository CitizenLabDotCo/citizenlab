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
          label: formatMessage(messages.tabRepresentativeness),
          name: 'representativeness',
          url: '/admin/dashboard/representation',
          feature: 'representativeness',
        },
        insertAfterName: 'users',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return null;
};

export default Tab;
