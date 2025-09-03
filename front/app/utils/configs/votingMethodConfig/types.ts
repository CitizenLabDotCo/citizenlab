import { MessageDescriptor } from 'react-intl';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { UseFormatCurrencyReturn } from 'utils/currency/useFormatCurrency';

export type VoteSubmissionState =
  | 'hasNotSubmitted'
  | 'hasSubmitted'
  | 'submissionEnded';

export type GetStatusDescriptionProps = {
  project: IProjectData;
  submissionState: VoteSubmissionState;
  phase?: IPhaseData;
  formatCurrency: UseFormatCurrencyReturn;
};

type IdeaCardVoteInputProps = {
  ideaId: string;
  phase: IPhaseData;
};

type IdeaPageVoteInputProps = IdeaCardVoteInputProps & {
  compact: boolean;
};

/*
  Configuration Specifications

  StatusModule:
  - getStatusHeader: Returns header which appears directly above status module
  - getStatusTitle: Returns title for the status module
  - getStatusDescription: Returns description for the status module
  - getStatusSubmissionCountCopy: Returns copy related to the submission count
  - preSubmissionWarning: Returns warning to be displayed before submission is made
  - useVoteTerm: Returns whether the custom vote term should be used in front office
  - getIdeaPageVoteInput: Returns the vote input to be displayed on the idea page
  */
export type VotingMethodConfig = {
  getStatusHeader: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusTitle: (submissionState: VoteSubmissionState) => MessageDescriptor;
  getStatusSubmissionCountCopy?: (basketCount: number) => MessageDescriptor;
  getStatusDescription?: ({
    project,
    phase,
    submissionState,
  }: GetStatusDescriptionProps) => JSX.Element | null;
  getIdeaCardVoteInput: ({
    ideaId,
    phase,
  }: IdeaCardVoteInputProps) => JSX.Element | null;
  getIdeaPageVoteInput: ({
    ideaId,
    compact,
    phase,
  }: IdeaPageVoteInputProps) => JSX.Element | null;
  preSubmissionWarning: () => MessageDescriptor;
  useVoteTerm: boolean;
};
