import { FC, useEffect } from 'react';
import { MessageValue } from 'react-intl';
import { ITab, MessageDescriptor } from 'typings';
import messages from './messages';

type Props = {
  onData: (data: {
    insertAfterTabName?: string;
    tabConfiguration: ITab;
  }) => void;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: { [key: string]: MessageValue } | undefined
  ) => string;
};

const Tab: FC<Props> = ({ onData, formatMessage }) => {
  useEffect(
    () =>
      onData({
        tabConfiguration: {
          label: formatMessage(messages.permissionTab),
          name: 'permissions',
          url: '/admin/initiatives/permissions',
          feature: 'granular_permissions',
        },
        insertAfterTabName: 'manage',
      }),
    []
  );
  return null;
};

export default Tab;
