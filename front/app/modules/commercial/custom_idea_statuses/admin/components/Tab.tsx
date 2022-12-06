import { FC, useEffect } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import messages from './messages';

interface Props {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
}

const Tab: FC<Props & WithRouterProps & WrappedComponentProps> = ({
  onData,
  intl: { formatMessage },
  location,
}) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'statuses',
          label: formatMessage(messages.tabStatuses),
          url: '/admin/ideas/statuses',
          active: location.pathname.includes('/admin/ideas/statuses'),
        },
        insertAfterName: 'manage',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default withRouter(injectIntl(Tab));
