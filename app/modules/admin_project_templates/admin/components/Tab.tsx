import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { ITabItem } from 'components/UI/Tabs';

type Props = {
  onData: (data: { insertAfterName?: string; configuration: ITabItem }) => void;
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
      insertAfterName: 'scratch',
    });
  }, []);

  return null;
};

export default injectIntl(Tab);
