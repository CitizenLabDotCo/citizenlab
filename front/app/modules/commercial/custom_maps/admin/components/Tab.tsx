import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    const tabName = 'map';
    onData({
      configuration: {
        label: formatMessage(messages.mapTab),
        name: tabName,
        url: 'map',
        feature: 'custom_maps',
      },
      insertBeforeName: 'phases',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(Tab);
