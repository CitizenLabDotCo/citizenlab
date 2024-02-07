import React from 'react';
import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import BudgetingProgressBar from './BudgetingProgressBar';
import VotingProgressBar from './VotingProgressBar';

interface Props {
  phase: IPhase;
  idea: IIdeaData;
}

const ProgressBar = ({ phase, idea }: Props) => {
  const votingMethod = phase.data.attributes.voting_method;

  if (votingMethod === 'budgeting') {
    return <BudgetingProgressBar phase={phase} idea={idea} />;
  } else {
    return <VotingProgressBar phase={phase} idea={idea} />;
  }
};

export default ProgressBar;
