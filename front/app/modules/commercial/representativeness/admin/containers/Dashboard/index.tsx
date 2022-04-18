import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { GraphsContainer, ControlBar } from 'components/admin/GraphWrappers';
import Header from './Header';

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
      <ControlBar>
        <Header />
      </ControlBar>

      <GraphsContainer>TEST 2</GraphsContainer>
    </>
  );
};

export default RepresentativenessDashboard;
