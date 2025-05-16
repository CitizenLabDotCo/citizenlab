import { useEffect } from 'react';

import { WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions } from 'typings';

import { ITabItem } from 'components/UI/Tabs';

import { injectIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onData: (data: InsertConfigurationOptions<ITabItem>) => void;
  activeFlagsCount: number;
}

const ActivityWarningsTab = ({
  onData,
  activeFlagsCount,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'warnings',
          label: `${formatMessage(messages.warnings)} (${activeFlagsCount})`,
        },
        insertAfterName: 'read',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFlagsCount, onData]
  );
  return null;
};

export default injectIntl(ActivityWarningsTab);
