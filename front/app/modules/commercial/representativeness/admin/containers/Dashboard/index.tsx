import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { GraphsContainer } from 'components/admin/GraphWrappers';
import Header from './Header';
import Controls from './Controls';

const RepresentativenessDashboard = () => {
  const customFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!customFieldsActive || !representativenessActive) {
    return null;
  }

  return (
    <>
      <Box width="100%">
        <Header />
        <Controls />
      </Box>

      <GraphsContainer>TEST 2</GraphsContainer>
    </>
  );
};

export default RepresentativenessDashboard;
