import { isNilOrError } from 'utils/helperUtils';
import { getProjectInputTerm } from 'api/projects/utils';
import { IProjectData, ProcessType } from 'api/projects/types';
import { getPhaseInputTerm, IPhaseData } from 'services/phases';

export type TSurveyService =
  | 'typeform'
  | 'survey_xact'
  | 'survey_monkey'
  | 'google_forms'
  | 'enalyzer'
  | 'qualtrics'
  | 'smart_survey'
  | 'microsoft_forms'
  | 'snap_survey'
  | 'konveio';

export type ParticipationMethod =
  | 'ideation'
  | 'information'
  | 'native_survey'
  | 'survey'
  | 'budgeting'
  | 'poll'
  | 'volunteering';

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

export type VotingMethod = 'limited' | 'unlimited';

export type PresentationMode = 'card' | 'map';

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
