import { useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { ITabItem } from 'components/UI/Tabs';

declare module 'modules/commercial/moderation/admin/containers/index' {
  export interface ITabNamesMap {
    warnings: 'warnings';
  }
}

interface Props {
  onData: (data: InsertConfigurationOptions<ITabItem>) => void;
  activeFlagsCount: number;
}

const ActivityWarningsTab = ({
  onData,
  activeFlagsCount,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
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
