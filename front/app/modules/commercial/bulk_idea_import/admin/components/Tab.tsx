import { FC, useEffect } from 'react';
import { InsertConfigurationOptions, ITab } from 'typings';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

interface Props {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
}

const Tab: FC<Props & WrappedComponentProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'import',
          label: formatMessage(messages.import),
          url: '/admin/ideas/import',
        },
        insertAfterName: 'statuses',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default injectIntl(Tab);
