import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';

// components
import EmptyState from './EmptyState';
import useInsightsViews from '../../../hooks/useInsightsViews';
import InsightsList from './InsightsList';

const Insights: React.FC<InjectedIntlProps> = () => {
  const insightsViews = useInsightsViews();

  if (isNilOrError(insightsViews)) {
    return null;
  }

  return (
    <div>
      {insightsViews.length === 0 ? (
        <EmptyState />
      ) : (
        <InsightsList data={insightsViews} />
      )}
    </div>
  );
};

export default Insights;
