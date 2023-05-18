import { FC, useEffect } from 'react';
import { ITabsOutlet } from 'utils/moduleUtils';
import messages from './messages';

const NavItemComponent: FC<ITabsOutlet> = ({
  onData,
  formatMessage,
}: ITabsOutlet) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.feed),
          name: 'moderation',
          url: '/admin/dashboard/moderation',
          feature: 'moderation',
        },
        insertAfterName: 'overview',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default NavItemComponent;
