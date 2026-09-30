import { MessageDescriptor } from 'react-intl';

import { ProjectGenerationLevers } from 'api/project_generations/types';

import messages from './messages';

export type LeverId = keyof ProjectGenerationLevers;

export type LeverConfig = {
  id: LeverId;
  question: MessageDescriptor;
  options: MessageDescriptor[];
};

// The three-stop spectra the manager confirms before generating. The middle
// stop (index 1) is the default.
export const LEVERS: LeverConfig[] = [
  {
    id: 'influence',
    question: messages.leverInfluenceQuestion,
    options: [
      messages.leverInfluenceGather,
      messages.leverInfluenceTogether,
      messages.leverInfluenceResidents,
    ],
  },
  {
    id: 'how_fixed',
    question: messages.leverHowFixedQuestion,
    options: [
      messages.leverHowFixedEarly,
      messages.leverHowFixedDirection,
      messages.leverHowFixedDecided,
    ],
  },
  {
    id: 'reach',
    question: messages.leverReachQuestion,
    options: [
      messages.leverReachMany,
      messages.leverReachBalance,
      messages.leverReachDepth,
    ],
  },
  {
    id: 'audience',
    question: messages.leverAudienceQuestion,
    options: [
      messages.leverAudienceEveryone,
      messages.leverAudienceResidents,
      messages.leverAudienceInvited,
    ],
  },
];

export const DEFAULT_LEVERS: ProjectGenerationLevers = {
  influence: 1,
  how_fixed: 1,
  reach: 1,
  audience: 1,
};
