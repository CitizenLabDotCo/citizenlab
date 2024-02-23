import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const ReportTab = () => {
  const phaseReportsEnabled = useFeatureFlag({ name: 'phase_reports' });
  if (!phaseReportsEnabled) return null;

  return <>Report tab!</>;
};

export default ReportTab;
