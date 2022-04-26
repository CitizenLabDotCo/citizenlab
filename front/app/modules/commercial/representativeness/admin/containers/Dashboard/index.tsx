import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { GraphsContainer } from 'components/admin/GraphWrappers';
import Header from './Header';
import ChartFilters from '../../components/ChartFilters';

const RepresentativenessDashboard = () => {
  const [currentProjectFilter, setCurrentProjectFilter] = useState<string>();

  const onProjectFilter = ({ value }) => {
    setCurrentProjectFilter(value);
  };

  return (
    <>
      <Box width="100%">
        <Header />
        <ChartFilters
          currentProjectFilter={currentProjectFilter}
          onProjectFilter={onProjectFilter}
        />
      </Box>

      <GraphsContainer>{/* TODO */}</GraphsContainer>
    </>
  );
};

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
