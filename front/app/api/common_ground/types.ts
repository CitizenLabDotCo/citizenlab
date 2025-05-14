import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import commonGroundProgressKeys from './keys/commonGroundProgressKeys';
import commonGroundResultsKeys from './keys/commonGroundResultsKeys';

export type CommonGroundResultsKeys = Keys<typeof commonGroundResultsKeys>;

export type CommonGroundProgressKeys = Keys<typeof commonGroundProgressKeys>;

export interface CommonGroundResultItem {
  label: Multiloc;
  agree: number;
  unsure: number;
  disagree: number;
  total: number;
}

export interface CommonGroundResultsData {
  id: string;
  type: 'phase-results';
  attributes: {
    numParticipants: number;
    numStatements: number;
    numVotes: number;
    majority: CommonGroundResultItem[];
    divisive: CommonGroundResultItem[];
    uncertain: CommonGroundResultItem[];
    allStatements: CommonGroundResultItem[];
  };
}

export interface CommonGroundProgressStatement {
  id: string;
  author: string;
  publishedAt: string;
  body: Multiloc;
}

export interface ProgressData {
  id: string;
  type: 'common_ground_progress';
  attributes: {
    num_ideas: number;
    num_reacted_ideas: number;
    nextIdea: CommonGroundProgressStatement | null;
  };
  relationships: {
    next_idea: {
      data: IRelationship[];
    };
  };
}

export type CommonGroundReactionMode = 'agree' | 'unsure' | 'disagree';

export interface ICommonGroundResults {
  data: CommonGroundResultsData;
}

export interface ICommonGroundProgress {
  data: ProgressData;
}

export interface ReactToIdeaObject {
  phaseId?: string | undefined;
  ideaId: string;
  mode: CommonGroundReactionMode;
}
