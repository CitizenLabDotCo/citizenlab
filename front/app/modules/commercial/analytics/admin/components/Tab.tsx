import { useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// i18n
import messages from './messages';

// typings
import { ITabsOutlet } from 'utils/moduleUtils';

const Tab = ({ onData, formatMessage }: ITabsOutlet) => {
  const visitorsDashboardEnabled = useFeatureFlag({
    name: 'visitors_dashboard',
  });

  useEffect(() => {
    if (visitorsDashboardEnabled !== true) return;

    onData({
      configuration: {
        label: formatMessage(messages.tabVisitors),
        name: 'visitors',
        url: '/admin/dashboard/visitors',
        feature: 'analytics',
      },
      insertAfterName: 'moderation',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorsDashboardEnabled]);

  return null;
};

export default Tab;
