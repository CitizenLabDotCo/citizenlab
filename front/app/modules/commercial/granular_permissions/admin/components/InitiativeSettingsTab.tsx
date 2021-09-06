import { FC, useEffect } from 'react';
import { InsertConfigurationOptions, ITab } from 'typings';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(
    () =>
      onData({
        configuration: {
          label: formatMessage(messages.permissionTab),
          name: 'permissions',
          url: '/admin/initiatives/permissions',
          feature: 'granular_permissions',
        },
        insertAfterName: 'manage',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default injectIntl(Tab);
