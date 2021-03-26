import { FC, useEffect } from 'react';
import { InsertConfigurationOptions, ITab } from 'typings';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
}

const Tab: FC<Props & WithRouterProps & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
  location,
}) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.tabInsights),
          url: '/admin/dashboard/insights',
          feature: 'clustering',
          name: 'clustering',
          active: location.pathname.includes('/admin/ideas/insights'),
        },
        insertAfterName: 'reports',
      }),
    []
  );
  return null;
};

export default withRouter(injectIntl(Tab));
