import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { VotingIdeaResult } from 'api/voting_insights/types';

import useLocalize from 'hooks/useLocalize';

import DemographicIdeaRow from './DemographicIdeaRow';

interface Props {
  label: string;
  ideas: VotingIdeaResult[];
  demographicKey: string;
}

const DemographicSection = ({ label, ideas, demographicKey }: Props) => {
  const localize = useLocalize();

  return (
    <Box mb="32px">
      <Title variant="h4" mb="16px" color="textPrimary">
        {label}
      </Title>
      {ideas.map((idea) => (
        <DemographicIdeaRow
          key={idea.id}
          idea={idea}
          title={localize(idea.title_multiloc)}
          demographicKey={demographicKey}
        />
      ))}
    </Box>
  );
};

export default DemographicSection;
