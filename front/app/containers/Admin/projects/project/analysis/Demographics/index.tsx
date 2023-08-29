import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import AuthorsByDomicile from './AuthorsByDomicile';

const Demographics = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box flex="1">Age</Box>
      <Box flex="1">
        <AuthorsByDomicile customFieldId="54a2f676-cbd7-420a-933e-d778ef599594" />
      </Box>
    </Box>
  );
};

export default Demographics;
