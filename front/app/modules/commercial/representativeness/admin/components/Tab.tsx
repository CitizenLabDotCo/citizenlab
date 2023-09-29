import { useEffect } from 'react';

// i18n
import messages from './messages';

// typings
import { ITabsOutlet } from 'utils/moduleUtils';

import { isAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';

const Tab = ({ onData, formatMessage }: ITabsOutlet) => {
  const { data: authUser } = useAuthUser();

  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.tabRepresentativeness),
          name: 'representativeness',
          url: '/admin/dashboard/representation',
          feature: 'representativeness',
        },
        insertAfterName: isAdmin(authUser) ? 'users' : 'overview',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authUser]
  );

  return null;
};

export default Tab;
