import React, { useState, useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useIntl } from 'utils/cl-intl';

// i18n
import messages from '../../../messages';

// typings
import { ITab } from 'typings';

interface Props {
  onData: (tabs: ITab[]) => void;
}

export default ({ onData }: Props) => {
  const { formatMessage } = useIntl();
  const [done, setDone] = useState(false);
  const insightsEnabled = useFeatureFlag({ name: 'insights_manual_flow' });
  const reportsEnabled = useFeatureFlag({ name: 'project_reports' });

  useEffect(() => {
    if (done) return;
    if (insightsEnabled === undefined || reportsEnabled === undefined) {
      return;
    }

    const tabs: ITab[] = [];

    if (insightsEnabled) {
      tabs.push({
        name: 'insights',
        label: formatMessage(messages.tabInsights),
        url: '/admin/reporting/insights',
      });
    }

    if (reportsEnabled) {
      tabs.push({
        name: 'reports',
        label: formatMessage(messages.tabReports),
        url: '/admin/reporting/reports',
      });
    }

    onData(tabs);
    setDone(true);
  }, [done, insightsEnabled, reportsEnabled, onData, formatMessage]);

  return <></>;
};
