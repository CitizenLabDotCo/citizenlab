import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  projectId: string;
  onData: (data: {
    insertAfterTabName?: string;
    tabConfiguration: ITab;
  }) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  projectId,
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      tabConfiguration: {
        label: formatMessage(messages.mapTab),
        name: 'map',
        url: `/admin/projects/${projectId}/map`,
        feature: 'custom_maps',
      },
      insertAfterTabName: 'ideaform',
    });
  }, []);

  return null;
};

export default injectIntl(Tab);
