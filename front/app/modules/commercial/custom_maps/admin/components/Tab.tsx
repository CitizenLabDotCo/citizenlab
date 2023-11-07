import { useEffect } from 'react';
import { InsertConfigurationOptions, ITab } from 'typings';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab = ({ onData }: Props) => {
  const { formatMessage } = useIntl();
  useEffect(() => {
    const tabName = 'map';
    onData({
      configuration: {
        label: formatMessage(messages.mapTab),
        name: tabName,
        url: 'map',
        feature: 'custom_maps',
      },
      insertAfterName: 'ideaform',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Tab;
