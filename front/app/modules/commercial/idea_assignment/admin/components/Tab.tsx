import { useEffect } from 'react';
import { InsertConfigurationOptions, ITab } from 'typings';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { useParams } from 'react-router-dom';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab = ({ onData }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.permissionsTab),
        url: `/admin/projects/${projectId}/settings/access-rights`,
        feature: 'private_projects',
        name: 'permissions',
      },
      insertAfterName: 'events',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Tab;
