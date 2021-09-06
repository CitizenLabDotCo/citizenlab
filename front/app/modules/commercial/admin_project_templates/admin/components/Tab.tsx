import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { ITabItem } from 'components/UI/Tabs';
import { InsertConfigurationOptions } from 'typings';

type Props = {
  onData: (data: InsertConfigurationOptions<ITabItem>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      configuration: {
        name: 'template',
        label: formatMessage(messages.fromATemplate),
        icon: 'template',
      },
      insertBeforeName: 'scratch',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(Tab);
