import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import ChartFilters from '../../components/ChartFilters';
import EmptyState from './EmptyState';
import ChartCards from './ChartCards';

// TODO remove router stuff
import { withRouter, WithRouterProps } from 'react-router';

const RepresentativenessDashboard = withRouter(
  ({ location: { search } }: WithRouterProps) => {
    const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

    const onProjectFilter = ({ value }) => {
      setCurrentProjectFilter(value);
    };

    const showEmpty = search === '?showEmpty=true';

    return (
      <>
        <Box width="100%" mb="36px">
          <Header />
          <ChartFilters
            currentProjectFilter={currentProjectFilter}
            onProjectFilter={onProjectFilter}
          />
        </Box>

        <Box>{showEmpty ? <EmptyState /> : <ChartCards />}</Box>
      </>
    );
  }
);

const RepresentativenessDashboardFeatureFlagWrapper = () => {
  const customFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!customFieldsActive || !representativenessActive) {
    return null;
  }

  return <RepresentativenessDashboard />;
};

export default RepresentativenessDashboardFeatureFlagWrapper;
