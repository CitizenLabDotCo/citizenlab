import { VotingMethod } from 'api/phases/types';

import budgetingConfig from './configs/budgetingConfig';
import multipleVotingConfig from './configs/multipleVotingConfig';
import singleVotingConfig from './configs/singleVotingConfig';
import { VotingMethodConfig } from './types';

// Get the configuration object for the given voting method
export function getVotingMethodConfig(
  votingMethod?: VotingMethod | null
): VotingMethodConfig | null {
  // Map voting methods to voting method configs
  const methodToConfig: {
    [method in VotingMethod]: VotingMethodConfig;
  } = {
    budgeting: budgetingConfig,
    multiple_voting: multipleVotingConfig,
    single_voting: singleVotingConfig,
  };

  if (!votingMethod) return null;

  return methodToConfig[votingMethod];
}
