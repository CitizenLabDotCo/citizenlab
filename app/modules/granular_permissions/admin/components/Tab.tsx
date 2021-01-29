import { FC, useEffect } from 'react';
import { MessageValue } from 'react-intl';
import { ITab, MessageDescriptor } from 'typings';
import messages from './messages';

type Props = {
  onData: (data: { after?: string; configuration: ITab }) => void;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: { [key: string]: MessageValue } | undefined
  ) => string;
};

const Tab: FC<Props> = ({ onData, formatMessage }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.permissionTab),
          name: 'permissions',
          url: '/admin/initiatives/permissions',
          feature: 'granular_permissions',
        },
        after: 'manage',
      }),
    []
  );
  return null;
};

export default Tab;
