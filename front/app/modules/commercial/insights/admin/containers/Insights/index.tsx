import React from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';

// components
import EmptyState from './EmptyState';
import useInsightsViews from '../../../hooks/useInsightsViews';
import InsightsList from './InsightsList';

const Insights: React.FC<InjectedIntlProps> = () => {
  const insightsViews = useInsightsViews();
  console.log(insightsViews);
  return (
    <div>
      <EmptyState />
      <InsightsList />
    </div>
  );
};

export default Insights;
