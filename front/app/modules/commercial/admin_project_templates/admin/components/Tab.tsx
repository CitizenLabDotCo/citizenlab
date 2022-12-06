import { FC, useEffect } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import { ITabItem } from 'components/UI/Tabs';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITabItem>) => void;
};

const Tab: FC<Props & WrappedComponentProps> = ({
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
