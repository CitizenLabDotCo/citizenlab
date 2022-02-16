import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';
import useFeatureFlag from 'hooks/useFeatureFlag';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

  useEffect(() => {
    if (!featureEnabled) return;

    onData({
      configuration: {
        label: formatMessage(messages.tabNavigation),
        url: '/admin/settings/navigation',
        name: 'navigation',
      },
      insertAfterName: 'customize',
      removeName: 'pages',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(Tab);
