import { isNilOrError } from 'utils/helperUtils';
import { getProjectInputTerm } from 'api/projects/utils';
import { IProjectData, ProcessType } from 'api/projects/types';
import { getPhaseInputTerm } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import { Multiloc } from 'typings';

export type TSurveyService =
  | 'typeform'
  | 'survey_xact'
  | 'survey_monkey'
  | 'google_forms'
  | 'enalyzer'
  | 'qualtrics'
  | 'smart_survey'
  | 'microsoft_forms'
  | 'snap_survey';

export type ParticipationMethod =
  | 'ideation'
  | 'information'
  | 'native_survey'
  | 'survey'
  | 'voting'
  | 'poll'
  | 'volunteering'
  | 'document_annotation';

export type VotingMethod = 'budgeting' | 'multiple_voting' | 'single_voting';

export type IdeaDefaultSortMethod =
  | 'trending'
  | 'random'
  | 'popular'
  | 'new'
  | '-new'
  | null;

export const INPUT_TERMS = [
  'idea',
  'option',
  'project',
  'question',
  'issue',
  'contribution',
];
export type InputTerm =
  | 'idea'
  | 'option'
  | 'project'
  | 'question'
  | 'issue'
  | 'contribution';

export type PresentationMode = 'card' | 'map';

export interface ParticipationContext {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  input_term: InputTerm;
  created_at: string;
  updated_at: string;
  participation_method: ParticipationMethod;
  posting_enabled: boolean;
  commenting_enabled: boolean;
  reacting_enabled: boolean;
  reacting_like_method: 'limited' | 'unlimited';
  reacting_like_limited_max: number;
  reacting_dislike_method: 'limited' | 'unlimited';
  allow_anonymous_participation: boolean;
  reacting_dislike_enabled: boolean;
  reacting_dislike_limited_max: number;
  presentation_mode: PresentationMode;
  survey_service?: TSurveyService | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
  ideas_count: number;
  ideas_order?: IdeaDefaultSortMethod;
  document_annotation_embed_url?: string | null;
  voting_method?: VotingMethod | null;
  voting_term_singular_multiloc?: Multiloc | null;
  voting_term_plural_multiloc?: Multiloc | null;
  voting_min_total?: number | null;
  voting_max_total?: number | null;
  voting_max_votes_per_idea?: number | null;
  baskets_count?: number | null;
  votes_count?: number | null;
}

export function getInputTerm(
  processType: ProcessType,
  project: IProjectData | undefined | null | Error,
  phases: IPhaseData[] | undefined,
  phase?: IPhaseData | undefined | null | Error
) {
  if (processType === 'continuous') {
    // To make sure copy depending on an input_term doesn't break,
    // we have a fallback to idea here.
    return !isNilOrError(project) ? getProjectInputTerm(project) : 'idea';
  }
  if (processType === 'timeline') {
    // (2020/12/9): When a new timeline project is created, phases will initially
    // be []. To make sure we don't break copy that depends on an input_term,
    // we have the fallback to idea here in that case.
    if (!isNilOrError(phase)) {
      return getPhaseInputTerm([phase]);
    } else if (phases && phases.length > 0) {
      return getPhaseInputTerm(phases);
    }
  }
  return 'idea';
}

export const ideaDefaultSortMethodFallback = 'trending';

export const getDefaultSortMethodFallback = (isIdeation: boolean) => {
  return isIdeation ? 'trending' : 'random';
};
