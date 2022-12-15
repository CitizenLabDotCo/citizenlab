import { FC, useEffect } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & WrappedComponentProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.tabTopics),
        name: 'topics',
        url: '/admin/settings/topics',
        feature: 'custom_topics',
        active: (pathname) => pathname.includes('/admin/settings/topics'),
      },
      insertAfterName: 'registration',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(Tab);
