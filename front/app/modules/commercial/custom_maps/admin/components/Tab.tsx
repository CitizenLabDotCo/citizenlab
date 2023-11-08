import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InsertConfigurationOptions, ITab } from 'typings';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab = ({ onData }: Props) => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams() as {
    phaseId: string;
  };
  useEffect(() => {
    const tabName = 'map';
    onData({
      configuration: {
        label: formatMessage(messages.mapTab),
        name: tabName,
        url: `map/${phaseId}`,
        feature: 'custom_maps',
      },
      insertAfterName: 'ideaform',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Tab;
