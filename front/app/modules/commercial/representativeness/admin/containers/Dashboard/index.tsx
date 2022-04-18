import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { GraphsContainer, ControlBar } from 'components/admin/GraphWrappers';

export default () => {
  const customFieldsActive = useFeatureFlag({ name: 'user_custom_fields' });
  const representativenessActive = useFeatureFlag({
    name: 'representativeness',
  });

  if (!customFieldsActive || !representativenessActive) {
    return null;
  }

  return (
    <>
      <ControlBar>TEST</ControlBar>

      <GraphsContainer>TEST 2</GraphsContainer>
    </>
  );
};
