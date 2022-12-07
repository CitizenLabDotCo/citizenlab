import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const ReportBuilder = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  if (!reportBuilderEnabled) return null;

  return <>Report builder!</>;
};

export default ReportBuilder;
