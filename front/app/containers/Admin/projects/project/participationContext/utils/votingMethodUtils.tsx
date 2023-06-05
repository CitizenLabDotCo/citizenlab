import React, { ReactNode } from 'react';
import BudgetingInputs from '../components/voting/votingMethodInputs/BudgetingInputs';
import { VotingInputsProps } from '../components/VotingInputs';

/*
  Configuration Descriptions:
  - getVotingMethodInputs: renders specific voting method inputs in back office settings
  */

export type VotingMethodType = 'budgeting';

export type VotingMethodConfig = {
  getVotingMethodInputs?: (
    props: VotingInputsProps
  ) => ReactNode | JSX.Element | null;
};

const budgetingConfig: VotingMethodConfig = {
  getVotingMethodInputs: (props: VotingInputsProps) => {
    return <BudgetingInputs props={props} />;
  },
};

// Get the configuration object for the given voting method
export function getVotingMethodConfig(
  votingMethod?: VotingMethodType | null
): VotingMethodConfig | null {
  if (!votingMethod) return null;
  return methodToConfig[votingMethod];
}

// Map voting methods to voting method configs
const methodToConfig: {
  [method in VotingMethodType]: VotingMethodConfig;
} = {
  budgeting: budgetingConfig,
};
