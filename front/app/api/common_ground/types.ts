import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import commonGroundProgressKeys from './keys/commonGroundProgressKeys';
import commonGroundResultsKeys from './keys/commonGroundResultsKeys';

export type CommonGroundResultsKeys = Keys<typeof commonGroundResultsKeys>;

export type CommonGroundProgressKeys = Keys<typeof commonGroundProgressKeys>;

export interface CommonGroundResultItem {
  id: string;
  title_multiloc: Multiloc;
  votes: {
    up: number;
    down: number;
    neutral: number;
  };
}

interface Stats {
  num_participants: number;
  num_ideas: number;
  votes: {
    up: number;
    down: number;
    neutral: number;
  };
}

export interface CommonGroundResultsData {
  id: string;
  type: 'common_ground_results';
  attributes: {
    stats: Stats;
    top_consensus_ideas: CommonGroundResultItem[];
    top_controversial_ideas: CommonGroundResultItem[];
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
      data: IRelationship | null;
    };
  };
}

export type CommonGroundReactionMode = 'up' | 'neutral' | 'down';

export interface ICommonGroundResults {
  data: CommonGroundResultsData;
}

export interface ICommonGroundProgress {
  data: ProgressData;
}

export interface ReactToIdeaObject {
  ideaId: string;
  mode: CommonGroundReactionMode;
}
