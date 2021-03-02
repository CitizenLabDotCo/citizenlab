import { FC, useEffect } from 'react';
import { MessageValue } from 'react-intl';
import { ITab, MessageDescriptor } from 'typings';
import messages from './messages';

type Props = {
  projectId: string;
  onData: (data: {
    insertAfterTabName?: string;
    tabConfiguration: ITab;
  }) => void;
  formatMessage: (
    messageDescriptor: MessageDescriptor,
    values?: { [key: string]: MessageValue } | undefined
  ) => string;
};

const Tab: FC<Props> = ({ projectId, onData, formatMessage }) => {
  useEffect(() => {
    onData({
      tabConfiguration: {
        label: formatMessage(messages.mapTab),
        name: 'map',
        url: `/admin/projects/${projectId}/map`,
        // feature: 'mapping',
      },
      insertAfterTabName: 'ideaform',
    });
  }, []);

  return null;
};

export default Tab;
