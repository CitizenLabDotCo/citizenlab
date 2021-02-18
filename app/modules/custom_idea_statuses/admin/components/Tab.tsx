import { FC, useEffect } from 'react';
import { InsertTabOptions } from 'typings';
import { withRouter, WithRouterProps } from 'react-router';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  onData: (data: InsertTabOptions) => void;
}

const Tab: FC<Props & WithRouterProps & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
  location,
}) => {
  useEffect(
    () =>
      onData({
        tabConfiguration: {
          label: formatMessage(messages.tabStatuses),
          url: '/admin/ideas/statuses',
          active: location.pathname.includes('/admin/ideas/statuses'),
        },
        insertAfterTabName: 'manage',
      }),
    []
  );
  return null;
};

export default withRouter(injectIntl(Tab));
