import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { ITabItem } from 'components/UI/Tabs';

type Props = {
  onData: (data: {
    insertAfterTabName?: string;
    tabConfiguration: ITabItem;
  }) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      tabConfiguration: {
        name: 'template',
        label: formatMessage(messages.fromATemplate),
        icon: 'template',
      },
      insertAfterTabName: 'scratch',
    });
  }, []);

  return null;
};

export default injectIntl(Tab);
