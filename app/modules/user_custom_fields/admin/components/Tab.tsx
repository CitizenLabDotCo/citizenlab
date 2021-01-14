import { TabProps } from 'containers/Admin/dashboard/components/DashboardTabs';
import { FC, useEffect } from 'react';

import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onData: (data: { after?: string; configuration: TabProps }) => void;
}

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      configuration: {
        name: 'registration',
        label: formatMessage(messages.tabRegistrationFields),
        url: '/admin/settings/registration',
      },
      after: 'customize',
    });
  }, []);
  return null;
};

export default injectIntl(Tab);
