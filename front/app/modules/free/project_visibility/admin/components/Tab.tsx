import { FC, useEffect } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
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
        label: formatMessage(messages.permissionsTab),
        url: `permissions`,
        feature: 'private_projects',
        name: 'permissions',
      },
      insertAfterName: 'events',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default injectIntl(Tab);
