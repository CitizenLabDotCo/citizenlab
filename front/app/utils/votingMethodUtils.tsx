import React, { ReactNode } from 'react';

export type VotingMethodType = 'budgeting';

export type VotingMethodConfig = {
  adminParticipationContextInputs?: () => ReactNode | JSX.Element | null; // Returns the fields for admin participation context settings
};

const budgetingConfig: VotingMethodConfig = {
  adminParticipationContextInputs: () => {
    return <h1>Hello!</h1>;
  },
};

// Get the configuration object for the given voting method
export function getVotingMethodConfig(
  votingMethod: VotingMethodType
): VotingMethodConfig {
  return methodToConfig[votingMethod];
}

// Map voting methods to voting method configs
const methodToConfig: {
  [method in VotingMethodType]: VotingMethodConfig;
} = {
  budgeting: budgetingConfig,
};
