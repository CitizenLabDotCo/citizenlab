import { useEffect } from 'react';
// typings
import { ITabsOutlet } from 'utils/moduleUtils';
// i18n
import messages from './messages';

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
