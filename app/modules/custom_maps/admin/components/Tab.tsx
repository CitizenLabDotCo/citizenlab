import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  projectId: string;
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  projectId,
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.mapTab),
        name: 'map',
        url: `/admin/projects/${projectId}/map`,
        feature: 'custom_maps',
      },
      insertAfterName: 'ideaform',
    });
  }, []);

  return null;
};

export default injectIntl(Tab);
