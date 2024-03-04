import { FC, useEffect } from 'react';

import { WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';

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
          label: formatMessage(messages.tabInputStatuses),
          url: '/admin/settings/statuses',
          active: location.pathname.includes('/admin/settings/statuses'),
        },
        insertAfterName: 'areas',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default withRouter(injectIntl(Tab));
