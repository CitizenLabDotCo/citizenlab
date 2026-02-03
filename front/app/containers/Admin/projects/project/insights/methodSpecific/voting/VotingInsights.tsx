import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ExportableInsight from '../../word/ExportableInsight';
import { MethodSpecificInsightProps } from '../types';

import VoteResults from './VoteResults';

const VotingInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  return (
    <ExportableInsight exportId="vote-results" my="12px" bg="white">
      <Box>
        <VoteResults phaseId={phaseId} />
      </Box>
    </ExportableInsight>
  );
};

export default VotingInsights;
